package com.example.backend.entity;

import com.example.backend.enums.RegistrationStatus;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/** Thí sinh đăng ký tham gia một cuộc thi. Mỗi thí sinh chỉ đăng ký 1 lần / cuộc thi. */
@CompoundIndex(name = "contest_participant_unique", def = "{'contestId': 1, 'participantId': 1}", unique = true)
@Document(collection = "contest_registrations")
public class ContestRegistration extends BaseDocument {

    /** -> contests._id */
    private String contestId;

    /** -> users._id (role PARTICIPANT) */
    @Indexed
    private String participantId;

    private RegistrationStatus status = RegistrationStatus.PENDING;

    /** Lý do từ chối nếu có */
    private String note;

    public ContestRegistration() {
    }

    public String getContestId() {
        return contestId;
    }

    public void setContestId(String contestId) {
        this.contestId = contestId;
    }

    public String getParticipantId() {
        return participantId;
    }

    public void setParticipantId(String participantId) {
        this.participantId = participantId;
    }

    public RegistrationStatus getStatus() {
        return status;
    }

    public void setStatus(RegistrationStatus status) {
        this.status = status;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
