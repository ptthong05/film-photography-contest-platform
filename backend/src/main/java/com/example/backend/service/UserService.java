package com.example.backend.service;

import com.example.backend.dto.UserRequest;
import com.example.backend.dto.UserResponse;
import com.example.backend.entity.User;
import com.example.backend.enums.Role;
import com.example.backend.exception.DuplicateResourceException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/** Service mẫu: chứa toàn bộ business logic, nhận/trả DTO. */
@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::fromEntity)
                .toList();
    }

    public UserResponse getUserById(String id) {
        return UserResponse.fromEntity(findUserOrThrow(id));
    }

    public UserResponse createUser(UserRequest request) {
        ensureEmailNotTaken(request.email());

        User user = new User();
        applyRequest(user, request);
        return UserResponse.fromEntity(userRepository.save(user));
    }

    public UserResponse updateUser(String id, UserRequest request) {
        User user = findUserOrThrow(id);
        if (!user.getEmail().equalsIgnoreCase(request.email())) {
            ensureEmailNotTaken(request.email());
        }

        applyRequest(user, request);
        return UserResponse.fromEntity(userRepository.save(user));
    }

    public void deleteUser(String id) {
        userRepository.delete(findUserOrThrow(id));
    }

    private User findUserOrThrow(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + id));
    }

    private void ensureEmailNotTaken(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email đã tồn tại: " + email);
        }
    }

    private void applyRequest(User user, UserRequest request) {
        user.setName(request.name());
        user.setEmail(request.email());
        user.setRole(request.role() != null ? request.role() : Role.PARTICIPANT);
    }
}
