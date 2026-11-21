package com.example.backend;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.example.backend.dto.*;
import com.example.backend.service.*;
import com.example.backend.controller.*;

import org.junit.jupiter.api.*;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class ApiContractTest {
    FilmRollService rolls;
    SubmissionService submissions;
    MockMvc mvc;

    @BeforeEach
    void init() {
        rolls = mock(FilmRollService.class);
        submissions = mock(SubmissionService.class);
        mvc =
                MockMvcBuilders.standaloneSetup(
                                new FilmRollController(rolls),
                                new SubmissionController(submissions))
                        .setControllerAdvice(new Tv3ExceptionHandler())
                        .build();
    }

    @Test
    void returns401ForUnauthenticatedUser() throws Exception {
        when(rolls.list()).thenThrow(new Tv3Exception(401, "Vui lòng đăng nhập"));
        mvc.perform(get("/api/film-rolls"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void invalidJsonRollReturns400WithFieldName() throws Exception {
        mvc.perform(post("/api/film-rolls").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(
                        jsonPath("$.message").value(org.hamcrest.Matchers.containsString("name")));
        verifyNoInteractions(rolls);
    }

    @Test
    void deleteReturns204AndConflictReturns409() throws Exception {
        mvc.perform(delete("/api/submissions/id")).andExpect(status().isNoContent());
        doThrow(new Tv3Exception(409, "Chỉ sửa/xóa bài PENDING")).when(submissions).delete("id");
        mvc.perform(delete("/api/submissions/id")).andExpect(status().isConflict());
    }

    @Test
    void optimisticConcurrencyConflictReturns409() throws Exception {
        doThrow(
                        new org.springframework.orm.ObjectOptimisticLockingFailureException(
                                com.example.backend.entity.Submission.class, "id"))
                .when(submissions)
                .delete("id");
        mvc.perform(delete("/api/submissions/id")).andExpect(status().isConflict());
    }

    @Test
    void multipartRejectsMissingMetadata() throws Exception {
        mvc.perform(
                        multipart("/api/submissions")
                                .file(new MockMultipartFile("file", new byte[] {1}))
                                .param("contestId", "contest")
                                .param("title", "Ảnh")
                                .param("category", "Street"))
                .andExpect(status().isBadRequest())
                .andExpect(
                        jsonPath("$.message")
                                .value(org.hamcrest.Matchers.containsString("filmBrand")));
        verifyNoInteractions(submissions);
    }

    @Test
    void multipartBindsFrontendFieldNamesAndReturns201() throws Exception {
        var q = MetadataTest.valid();
        mvc.perform(
                        multipart("/api/submissions")
                                .file(new MockMultipartFile("file", new byte[] {1}))
                                .param("contestId", q.contestId())
                                .param("title", q.title())
                                .param("category", q.category())
                                .param("filmBrand", q.filmBrand())
                                .param("filmStock", q.filmStock())
                                .param("iso", "200")
                                .param("camera", q.camera())
                                .param("lens", q.lens())
                                .param("format", q.format())
                                .param("frameNumber", "1")
                                .param("shootingLocation", q.shootingLocation())
                                .param("developingLab", q.developingLab())
                                .param("scanningSpecs", q.scanningSpecs()))
                .andExpect(status().isCreated());
        verify(submissions)
                .create(
                        argThat(r -> r.iso() == 200 && r.camera().equals("Canon")),
                        any(),
                        isNull());
    }
}
