package com.example.backend.tv3.repository;

import com.example.backend.tv3.entity.Frame;

import org.springframework.data.jpa.repository.*;

import java.util.*;

public interface FrameRepository extends JpaRepository<Frame, String> {
    List<Frame> findByFilmRollIdOrderByFrameNumberAsc(String rollId);

    boolean existsByFilmRollIdAndFrameNumber(String rollId, int number);

    boolean existsByFilmRollIdAndFrameNumberGreaterThan(String rollId, int number);

    boolean existsByFilmRollId(String rollId);
}
