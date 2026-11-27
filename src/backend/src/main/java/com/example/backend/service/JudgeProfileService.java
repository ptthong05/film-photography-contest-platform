package com.example.backend.service;

import com.example.backend.dto.JudgeProfileRequest;
import com.example.backend.dto.JudgeProfileResponse;
import com.example.backend.entity.JudgeProfile;
import com.example.backend.entity.User;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.JudgeProfileRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Hồ sơ của giám khảo đang đăng nhập; judgeId luôn lấy từ JWT nên không sửa được hồ sơ người khác. */
@Service
public class JudgeProfileService {

    private final UserRepository userRepository;
    private final JudgeProfileRepository profileRepository;

    public JudgeProfileService(UserRepository userRepository, JudgeProfileRepository profileRepository) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
    }

    public JudgeProfileResponse getProfile(String judgeId) {
        User judge = requireUser(judgeId);
        return JudgeProfileResponse.from(judge, profileRepository.findByUserId(judgeId).orElse(null));
    }

    @Transactional
    public JudgeProfileResponse updateProfile(String judgeId, JudgeProfileRequest request) {
        User judge = requireUser(judgeId);
        judge.setName(request.fullName().trim());

        JudgeProfile profile = profileRepository.findByUserId(judgeId).orElseGet(() -> {
            JudgeProfile created = new JudgeProfile();
            created.setUserId(judgeId);
            return created;
        });
        profile.setSpecialty(trimToNull(request.specialty()));
        profile.setBio(trimToNull(request.bio()));
        profile.setAvatarUrl(trimToNull(request.avatarUrl()));

        return JudgeProfileResponse.from(userRepository.save(judge), profileRepository.save(profile));
    }

    private User requireUser(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản giám khảo"));
    }

    private static String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
