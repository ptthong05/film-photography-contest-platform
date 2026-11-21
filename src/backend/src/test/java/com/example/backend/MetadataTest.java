package com.example.backend;

import static org.assertj.core.api.Assertions.*;

import com.example.backend.dto.*;

import jakarta.validation.*;

import org.junit.jupiter.api.*;

import java.time.LocalDate;
import java.util.*;

class MetadataTest {
    static ValidatorFactory factory;
    static Validator validator;

    @BeforeAll
    static void init() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void close() {
        factory.close();
    }

    static SubmissionRequest valid() {
        return new SubmissionRequest(
                "contest", "Ảnh", "Mô tả", "Street", null, "Kodak", "Gold", 200, "Canon", "50mm",
                "35mm", "1", null, "Hà Nội", "Lab", "4000dpi");
    }

    @Test
    void validTenFieldsAndOptionalShootingDate() {
        assertThat(validator.validate(valid())).isEmpty();
    }

    @Test
    void everyRequiredMetadataRejectsNullAndWhitespace() throws Exception {
        var components = SubmissionRequest.class.getRecordComponents();
        var constructor = SubmissionRequest.class.getDeclaredConstructors()[0];
        var fields =
                Set.of(
                        "filmBrand",
                        "filmStock",
                        "iso",
                        "camera",
                        "lens",
                        "format",
                        "frameNumber",
                        "shootingLocation",
                        "developingLab",
                        "scanningSpecs");
        for (int i = 0; i < components.length; i++)
            if (fields.contains(components[i].getName())) {
                for (Object invalid :
                        components[i].getType() == Integer.class
                                ? new Object[] {null, 0, -1}
                                : new Object[] {null, "", "   "}) {
                    Object[] args = new Object[components.length];
                    for (int j = 0; j < args.length; j++)
                        args[j] = components[j].getAccessor().invoke(valid());
                    args[i] = invalid;
                    var q = (SubmissionRequest) constructor.newInstance(args);
                    String field = components[i].getName();
                    assertThat(validator.validate(q))
                            .anyMatch(v -> v.getPropertyPath().toString().equals(field));
                }
            }
    }

    @Test
    void rejectsOversizeMetadataBadFrameAndFutureDate() {
        var q =
                new SubmissionRequest(
                        "contest",
                        "Ảnh",
                        null,
                        "Street",
                        null,
                        "x".repeat(121),
                        "Gold",
                        1,
                        "Canon",
                        "lens",
                        "35mm",
                        "0",
                        LocalDate.now().plusDays(1),
                        "location",
                        "lab",
                        "scan");
        assertThat(validator.validate(q))
                .extracting(v -> v.getPropertyPath().toString())
                .contains("filmBrand", "frameNumber", "shootingDate");
    }

    @Test
    void rollAndFrameValidation() {
        assertThat(validator.validate(new FilmRollRequest(" ", " ", 0, " ", " ", 0, null)))
                .hasSize(6);
        assertThat(validator.validate(new FrameRequest(0, "x".repeat(1001)))).hasSize(2);
    }
}
