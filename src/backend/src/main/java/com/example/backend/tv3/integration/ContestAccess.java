package com.example.backend.tv3.integration;

import java.time.Instant;
import java.util.Set;

/**
 * TV2 adapter must use the SAME JPA transaction, locking a stable contest/registration row. Lock
 * ordering: contest/registration -> FilmRoll -> Submission. Never fabricate an approval.
 * Participation must check contest exists, registration APPROVED, dates, category and return a
 * positive limit. Lock must serialize concurrent creates for the same participant/contest,
 * including when count is zero. Management must verify organizer ownership (or explicit shared
 * ADMIN policy).
 */
public interface ContestAccess {
    int lockParticipation(String contestId, String participantId, String category, Instant now);

    void lockEditableContest(String contestId, String participantId, Instant now);

    void lockManagement(String contestId, Actor actor);

    Set<String> managedContestIds(Actor actor);
}
