package com.example.backend.tv3.storage;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.cloudinary.Cloudinary;
import com.example.backend.tv3.web.Tv3Exception;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.Map;

class CloudinaryStorageTest {
    private static final String OWNED = "filmcontest-tv3/12345678-1234-1234-1234-123456789abc";

    @Test
    void refusesForeignAndMalformedIdsBeforeContactingCloud() {
        Cloudinary cloud = mock(Cloudinary.class);
        var storage = new CloudinaryStorage(cloud, true);
        for (String id :
                new String[] {"other-team/asset", "filmcontest-tv3/../other", "filmcontest-tv3/"})
            assertThatThrownBy(() -> storage.delete(id))
                    .isInstanceOf(Tv3Exception.class)
                    .hasMessageContaining("namespace TV3");
        verifyNoInteractions(cloud);
    }

    @Test
    void onlyConfirmedOrAlreadyMissingDeletesCountAsSuccess() throws Exception {
        Cloudinary cloud = mock(Cloudinary.class, RETURNS_DEEP_STUBS);
        var storage = new CloudinaryStorage(cloud, true);
        when(cloud.uploader().destroy(eq(OWNED), anyMap())).thenReturn(Map.of("result", "ok"));
        storage.delete(OWNED);
        when(cloud.uploader().destroy(eq(OWNED), anyMap()))
                .thenReturn(Map.of("result", "not found"));
        storage.delete(OWNED);
        when(cloud.uploader().destroy(eq(OWNED), anyMap())).thenReturn(Map.of("result", "error"));
        assertThatThrownBy(() -> storage.delete(OWNED)).hasMessageContaining("thất bại");
    }

    @Test
    void runtimeProviderFailureIsSanitizedAndCompensated() throws Exception {
        Cloudinary cloud = mock(Cloudinary.class, RETURNS_DEEP_STUBS);
        when(cloud.uploader().upload(any(byte[].class), anyMap()))
                .thenThrow(new IllegalStateException("provider internal detail"));
        when(cloud.uploader().destroy(anyString(), anyMap())).thenReturn(Map.of("result", "ok"));
        assertThatThrownBy(() -> new CloudinaryStorage(cloud, true).upload(new byte[] {1}))
                .isInstanceOf(Tv3Exception.class)
                .hasMessage("Upload ảnh thất bại");
        verify(cloud.uploader()).destroy(startsWith("filmcontest-tv3/"), anyMap());
    }

    @Test
    void failedDeleteDoesNotPretendSuccessOrExposeProviderDetails() throws Exception {
        Cloudinary cloud = mock(Cloudinary.class, RETURNS_DEEP_STUBS);
        when(cloud.uploader().destroy(eq(OWNED), anyMap()))
                .thenThrow(new IOException("sensitive provider data"));
        assertThatThrownBy(() -> new CloudinaryStorage(cloud, true).delete(OWNED))
                .hasMessage("Xóa tài nguyên cloud thất bại");
    }
}
