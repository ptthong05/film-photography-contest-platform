package com.example.backend;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.example.backend.enums.Role;
import com.example.backend.dto.*;
import com.example.backend.entity.*;
import com.example.backend.integration.*;
import com.example.backend.repository.*;
import com.example.backend.service.*;
import com.example.backend.storage.*;

import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.*;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.*;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.concurrent.*;

@DataJpaTest
@ActiveProfiles("tv3")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@EnabledIfEnvironmentVariable(named = "TV3_TEST_MYSQL_URL", matches = ".+")
class MySqlPersistenceTest {
    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void realRollbackKeepsOldCloudImageAndRemovesNewUpload() {
        var cloud = mock(ImageStorage.class);
        when(cloud.upload(any())).thenReturn(new ImageStorage.Asset("https://cloud/new", "new"));
        var images = new TransactionalImages(cloud);
        var createdId = new java.util.concurrent.atomic.AtomicReference<String>();
        assertThatThrownBy(
                        () ->
                                new TransactionTemplate(txManager)
                                        .executeWithoutResult(
                                                status -> {
                                                    createdId.set(roll().getId());
                                                    images.upload(new byte[] {1});
                                                    images.deleteAfterCommit("old");
                                                    throw new IllegalStateException(
                                                            "simulated failure after upload");
                                                }))
                .isInstanceOf(IllegalStateException.class);
        assertThat(rolls.findById(createdId.get())).isEmpty();
        verify(cloud).delete("new");
        verify(cloud, never()).delete("old");
    }

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void concurrentFrameClaimsAreRejectedByMySqlUniqueConstraint() throws Exception {
        var tx = new TransactionTemplate(txManager);
        String frameId = tx.execute(status -> frame(roll(), 1).getId());
        var gate = new CountDownLatch(2);
        var pool = Executors.newFixedThreadPool(2);
        Callable<Integer> claim =
                () -> {
                    try {
                        tx.executeWithoutResult(
                                status -> {
                                    Frame f = frames.findById(frameId).orElseThrow();
                                    gate.countDown();
                                    try {
                                        if (!gate.await(10, TimeUnit.SECONDS))
                                            throw new IllegalStateException("barrier timeout");
                                    } catch (InterruptedException e) {
                                        Thread.currentThread().interrupt();
                                        throw new IllegalStateException(e);
                                    }
                                    submission(f);
                                });
                        return 200;
                    } catch (org.springframework.dao.DataIntegrityViolationException
                            | org.springframework.dao.ConcurrencyFailureException conflict) {
                        return 409;
                    }
                };
        try {
            var first = pool.submit(claim);
            var second = pool.submit(claim);
            assertThat(
                            java.util.List.of(
                                    first.get(20, TimeUnit.SECONDS),
                                    second.get(20, TimeUnit.SECONDS)))
                    .containsExactlyInAnyOrder(200, 409);
        } finally {
            pool.shutdownNow();
        }
    }

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void participantEditAndOrganizerReviewCannotOverwriteFinalStatus() throws Exception {
        var tx = new TransactionTemplate(txManager);
        String id = tx.execute(status -> submission(null).getId());
        var actors = mock(CurrentActor.class);
        when(actors.require(Role.PARTICIPANT)).thenReturn(new Actor("owner", Role.PARTICIPANT));
        when(actors.require(Role.ORGANIZER, Role.ADMIN))
                .thenReturn(new Actor("organizer", Role.ORGANIZER));
        var ports = mock(IntegrationPorts.class);
        var contests = mock(ContestAccess.class);
        when(ports.contests()).thenReturn(contests);
        var gate = new CountDownLatch(2);
        org.mockito.stubbing.Answer<Integer> await =
                invocation -> {
                    gate.countDown();
                    if (!gate.await(10, TimeUnit.SECONDS))
                        throw new IllegalStateException("barrier timeout");
                    return 36;
                };
        when(contests.lockParticipation(any(), any(), any(), any())).thenAnswer(await);
        doAnswer(await).when(contests).lockManagement(any(), any());
        var service =
                new SubmissionService(
                        submissions,
                        frames,
                        mock(FilmRollService.class),
                        actors,
                        ports,
                        mock(ImageValidator.class),
                        mock(TransactionalImages.class),
                        entityManager);
        var q = MetadataTest.valid();
        var edited =
                new SubmissionRequest(
                        q.contestId(),
                        "Participant edit",
                        q.description(),
                        q.category(),
                        null,
                        q.filmBrand(),
                        q.filmStock(),
                        q.iso(),
                        q.camera(),
                        q.lens(),
                        q.format(),
                        q.frameNumber(),
                        q.shootingDate(),
                        q.shootingLocation(),
                        q.developingLab(),
                        q.scanningSpecs());
        var pool = Executors.newFixedThreadPool(2);
        try {
            var review =
                    pool.submit(
                            () -> {
                                try {
                                    tx.execute(
                                            status ->
                                                    service.review(
                                                            id,
                                                            new SubmissionStatusRequest(
                                                                    SubmissionStatus.VERIFIED,
                                                                    null)));
                                    return 200;
                                } catch (com.example.backend.exception.Tv3Exception conflict) {
                                    return conflict.status();
                                } catch (org.springframework.dao.ConcurrencyFailureException conflict) {
                                    return 409;
                                }
                            });
            var edit =
                    pool.submit(
                            () -> {
                                try {
                                    tx.execute(status -> service.update(id, edited, null, null));
                                    return 200;
                                } catch (com.example.backend.exception.Tv3Exception conflict) {
                                    return conflict.status();
                                } catch (
                                        org.springframework.dao.ConcurrencyFailureException
                                                conflict) {
                                    return 409;
                                }
                            });
            int reviewStatus = review.get(20, TimeUnit.SECONDS);
            int editStatus = edit.get(20, TimeUnit.SECONDS);
            assertThat(reviewStatus).isIn(200, 409);
            assertThat(editStatus).isIn(200, 409);
            assertThat(java.util.List.of(reviewStatus, editStatus)).contains(200);
            Submission saved = submissions.findById(id).orElseThrow();
            assertThat(saved.getStatus()).isEqualTo(reviewStatus == 200
                    ? SubmissionStatus.VERIFIED : SubmissionStatus.PENDING);
            assertThat(saved.getTitle()).isEqualTo(editStatus == 200 ? "Participant edit" : "Ảnh");
        } finally {
            pool.shutdownNow();
        }
    }

    @DynamicPropertySource
    static void db(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", () -> System.getenv("TV3_TEST_MYSQL_URL"));
        r.add("spring.datasource.username", () -> System.getenv("TV3_TEST_MYSQL_USER"));
        r.add("spring.datasource.password", () -> System.getenv("TV3_TEST_MYSQL_PASSWORD"));
    }

    @Autowired FilmRollRepository rolls;
    @Autowired FrameRepository frames;
    @Autowired SubmissionRepository submissions;
    @Autowired PlatformTransactionManager txManager;
    @Autowired jakarta.persistence.EntityManager entityManager;

    FilmRoll roll() {
        FilmRoll r = new FilmRoll();
        r.setParticipantId("owner");
        r.setName("Roll");
        r.setBrand("Kodak");
        r.setIso(200);
        r.setFormat("35mm");
        r.setCameraBody("Canon");
        r.setTotalFrames(36);
        return rolls.saveAndFlush(r);
    }

    Frame frame(FilmRoll r, int n) {
        Frame f = new Frame();
        f.setFilmRoll(r);
        f.setFrameNumber(n);
        return frames.saveAndFlush(f);
    }

    Submission submission(Frame f) {
        Submission s = new Submission();
        s.setParticipantId("owner");
        s.setContestId("contest");
        s.setFrame(f);
        s.setTitle("Ảnh");
        s.setCategory("Street");
        s.setStatus(SubmissionStatus.PENDING);
        s.setImageUrl("https://cloud/image");
        s.setImagePublicId(java.util.UUID.randomUUID().toString());
        s.setMetadata(MetadataTest.valid().metadata());
        return submissions.saveAndFlush(s);
    }

    @Test
    void migrationAndCrudOnRealMySql() {
        FilmRoll r = roll();
        Frame f = frame(r, 1);
        Submission s = submission(f);
        assertThat(submissions.findById(s.getId())).isPresent();
        assertThat(s.getCreatedAt()).isNotNull();
        s.setTitle("Đã sửa");
        submissions.saveAndFlush(s);
        assertThat(submissions.findById(s.getId()).orElseThrow().getTitle()).isEqualTo("Đã sửa");
        submissions.delete(s);
        submissions.flush();
        frames.delete(f);
        frames.flush();
        rolls.delete(r);
        rolls.flush();
        assertThat(rolls.findById(r.getId())).isEmpty();
    }

    @Test
    void uniqueFrameNumberEnforcedByDatabase() {
        FilmRoll r = roll();
        frame(r, 1);
        assertThatThrownBy(() -> frame(r, 1))
                .isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
    }

    @Test
    void frameCannotBeUsedByTwoSubmissions() {
        Frame f = frame(roll(), 1);
        submission(f);
        assertThatThrownBy(() -> submission(f))
                .isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
    }

    @Test
    void referencedFrameCannotBeDeleted() {
        Frame f = frame(roll(), 1);
        submission(f);
        assertThatThrownBy(
                        () -> {
                            frames.delete(f);
                            frames.flush();
                        })
                .isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
    }

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void rollbackLeavesNoPartialData() {
        String id =
                new TransactionTemplate(txManager)
                        .execute(
                                status -> {
                                    FilmRoll r = roll();
                                    frame(r, 1);
                                    status.setRollbackOnly();
                                    return r.getId();
                                });
        assertThat(rolls.findById(id)).isEmpty();
        assertThat(frames.findByFilmRollIdOrderByFrameNumberAsc(id)).isEmpty();
    }

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void concurrentReviewsSerializeAndSecondSeesFinalState() throws Exception {
        TransactionTemplate tx = new TransactionTemplate(txManager);
        String id = tx.execute(status -> submission(frame(roll(), 1)).getId());
        CountDownLatch locked = new CountDownLatch(1), release = new CountDownLatch(1);
        var pool = Executors.newFixedThreadPool(2);
        try {
            Future<?> first =
                    pool.submit(
                            () ->
                                    tx.executeWithoutResult(
                                            status -> {
                                                Submission s =
                                                        submissions.lockById(id).orElseThrow();
                                                locked.countDown();
                                                try {
                                                    if (!release.await(10, TimeUnit.SECONDS))
                                                        throw new IllegalStateException("timeout");
                                                } catch (InterruptedException e) {
                                                    Thread.currentThread().interrupt();
                                                    throw new IllegalStateException(e);
                                                }
                                                s.setStatus(SubmissionStatus.VERIFIED);
                                                submissions.saveAndFlush(s);
                                            }));
            assertThat(locked.await(10, TimeUnit.SECONDS)).isTrue();
            Future<SubmissionStatus> second =
                    pool.submit(
                            () ->
                                    tx.execute(
                                            status ->
                                                    submissions
                                                            .lockById(id)
                                                            .orElseThrow()
                                                            .getStatus()));
            release.countDown();
            first.get(15, TimeUnit.SECONDS);
            assertThat(second.get(15, TimeUnit.SECONDS)).isEqualTo(SubmissionStatus.VERIFIED);
        } finally {
            release.countDown();
            pool.shutdownNow();
        }
    }

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void concurrentServiceReviewsOnlyOneSucceeds() throws Exception {
        TransactionTemplate tx = new TransactionTemplate(txManager);
        String id = tx.execute(status -> submission(frame(roll(), 1)).getId());
        var actors =
                org.mockito.Mockito.mock(com.example.backend.integration.CurrentActor.class);
        var ports =
                org.mockito.Mockito.mock(com.example.backend.service.IntegrationPorts.class);
        var contests =
                org.mockito.Mockito.mock(com.example.backend.integration.ContestAccess.class);
        org.mockito.Mockito.when(
                        actors.require(
                                com.example.backend.enums.Role.ORGANIZER,
                                com.example.backend.enums.Role.ADMIN))
                .thenReturn(
                        new com.example.backend.integration.Actor(
                                "organizer", com.example.backend.enums.Role.ORGANIZER));
        org.mockito.Mockito.when(ports.contests()).thenReturn(contests);
        CountDownLatch ready = new CountDownLatch(2);
        org.mockito.Mockito.doAnswer(
                        invocation -> {
                            ready.countDown();
                            if (!ready.await(10, TimeUnit.SECONDS))
                                throw new IllegalStateException("concurrency barrier timeout");
                            return null;
                        })
                .when(contests)
                .lockManagement(
                        org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());
        var service =
                new com.example.backend.service.SubmissionService(
                        submissions,
                        frames,
                        org.mockito.Mockito.mock(
                                com.example.backend.service.FilmRollService.class),
                        actors,
                        ports,
                        org.mockito.Mockito.mock(
                                com.example.backend.storage.ImageValidator.class),
                        org.mockito.Mockito.mock(
                                com.example.backend.storage.TransactionalImages.class),
                        entityManager);
        var pool = Executors.newFixedThreadPool(2);
        Callable<Integer> review =
                () -> {
                    try {
                        tx.execute(
                                status ->
                                        service.review(
                                                id,
                                                new com.example.backend.tv3.dto
                                                        .SubmissionStatusRequest(
                                                        SubmissionStatus.VERIFIED, null)));
                        return 200;
                    } catch (com.example.backend.exception.Tv3Exception conflict) {
                        return conflict.status();
                    } catch (org.springframework.dao.ConcurrencyFailureException conflict) {
                        // Same 409 translation as Tv3ExceptionHandler when Hibernate detects a
                        // version change while acquiring the pessimistic lock.
                        return 409;
                    }
                };
        try {
            var first = pool.submit(review);
            var second = pool.submit(review);
            assertThat(
                            java.util.List.of(
                                    first.get(20, TimeUnit.SECONDS),
                                    second.get(20, TimeUnit.SECONDS)))
                    .containsExactlyInAnyOrder(200, 409);
        } finally {
            pool.shutdownNow();
        }
    }
}
