package com.example.backend.repository;

import com.example.backend.entity.Frame;

import org.springframework.data.jpa.repository.*;

import java.util.*;

public interface FrameRepository extends JpaRepository<Frame, String> {
    List<Frame> findByFilmRollIdOrderByFrameNumberAsc(String rollId);

    boolean existsByFilmRollIdAndFrameNumber(String rollId, int number);

    boolean existsByFilmRollIdAndFrameNumberGreaterThan(String rollId, int number);

    boolean existsByFilmRollId(String rollId);
}
