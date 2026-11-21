package com.example.backend;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.example.backend.storage.*;

import org.junit.jupiter.api.*;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.support.*;

import java.awt.image.BufferedImage;
import java.io.*;

import javax.imageio.ImageIO;

class ImageStorageTest {
    @Test
    void unknownCommitOutcomeNeverDeletesPotentiallyCommittedImage() {
        ImageStorage cloud = mock(ImageStorage.class);
        var images = new TransactionalImages(cloud);
        when(cloud.upload(any())).thenReturn(new ImageStorage.Asset("https://cloud/new", "new"));
        TransactionSynchronizationManager.initSynchronization();
        TransactionSynchronizationManager.setActualTransactionActive(true);
        try {
            images.upload(new byte[] {1});
            images.deleteAfterCommit("old");
            for (var callback : TransactionSynchronizationManager.getSynchronizations())
                callback.afterCompletion(TransactionSynchronization.STATUS_UNKNOWN);
            verify(cloud, never()).delete(any());
        } finally {
            TransactionSynchronizationManager.clear();
        }
    }

    @Test
    void rejectsTruncatedJpegEvenIfDecoderReturnsPartialPixels() throws Exception {
        var out = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(16, 16, BufferedImage.TYPE_INT_RGB), "jpeg", out);
        byte[] truncated = java.util.Arrays.copyOf(out.toByteArray(), out.size() - 2);
        assertThatThrownBy(
                        () ->
                                new ImageValidator(10000, 10000)
                                        .validate(
                                                new MockMultipartFile(
                                                        "file",
                                                        "photo.jpg",
                                                        "image/jpeg",
                                                        truncated)))
                .isInstanceOf(com.example.backend.exception.Tv3Exception.class);
    }

    @Test
    void rejectsInvalidUploadLimitConfiguration() {
        assertThatThrownBy(() -> new ImageValidator(0, 100))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new ImageValidator(Long.MAX_VALUE, 100))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new ImageValidator(100, 0))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void verifiesActualContentInsteadOfMimeOrName() throws Exception {
        var v = new ImageValidator(10000, 10000);
        var out = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(2, 2, BufferedImage.TYPE_INT_RGB), "png", out);
        assertThat(
                        v.validate(
                                new MockMultipartFile(
                                        "file",
                                        "../../fake.exe",
                                        "application/octet-stream",
                                        out.toByteArray())))
                .isNotEmpty();
        assertThatThrownBy(
                        () ->
                                v.validate(
                                        new MockMultipartFile(
                                                "file",
                                                "a.jpg",
                                                "image/jpeg",
                                                "not an image".getBytes())))
                .hasMessageContaining("không phải ảnh");
    }

    @Test
    void rejectsEmptyOversizeAndTooManyPixels() throws Exception {
        var v = new ImageValidator(10, 1);
        assertThatThrownBy(() -> v.validate(new MockMultipartFile("f", new byte[0])))
                .hasMessageContaining("không rỗng");
        assertThatThrownBy(() -> v.validate(new MockMultipartFile("f", new byte[11])))
                .hasMessageContaining("dung lượng");
        var out = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(2, 2, BufferedImage.TYPE_INT_RGB), "png", out);
        assertThatThrownBy(
                        () ->
                                new ImageValidator(10000, 1)
                                        .validate(new MockMultipartFile("f", out.toByteArray())))
                .hasMessageContaining("Kích thước");
    }

    @Test
    void rollbackDeletesNewAssetsAndCommitKeepsOldUntilSuccess() {
        ImageStorage cloud = mock(ImageStorage.class);
        var images = new TransactionalImages(cloud);
        when(cloud.upload(any())).thenReturn(new ImageStorage.Asset("https://cloud/new", "new"));
        TransactionSynchronizationManager.initSynchronization();
        TransactionSynchronizationManager.setActualTransactionActive(true);
        try {
            images.upload(new byte[] {1});
            images.deleteAfterCommit("old");
            verify(cloud, never()).delete(any());
            for (var callback : TransactionSynchronizationManager.getSynchronizations())
                callback.afterCompletion(TransactionSynchronization.STATUS_ROLLED_BACK);
            verify(cloud).delete("new");
            verify(cloud, never()).delete("old");
        } finally {
            TransactionSynchronizationManager.clear();
        }
    }

    @Test
    void successfulCommitDeletesOnlyOldAsset() {
        ImageStorage cloud = mock(ImageStorage.class);
        var images = new TransactionalImages(cloud);
        when(cloud.upload(any())).thenReturn(new ImageStorage.Asset("https://cloud/new", "new"));
        TransactionSynchronizationManager.initSynchronization();
        TransactionSynchronizationManager.setActualTransactionActive(true);
        try {
            images.upload(new byte[] {1});
            images.deleteAfterCommit("old");
            for (var callback : TransactionSynchronizationManager.getSynchronizations()) {
                callback.afterCommit();
                callback.afterCompletion(0);
            }
            verify(cloud).delete("old");
            verify(cloud, never()).delete("new");
        } finally {
            TransactionSynchronizationManager.clear();
        }
    }

    @Test
    void noCloudCredentialsFailsClosed() {
        assertThatThrownBy(() -> new CloudinaryStorage("", "", "").upload(new byte[] {1}))
                .hasMessageContaining("Chưa cấu hình");
    }
}
