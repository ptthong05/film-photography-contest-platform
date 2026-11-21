package com.example.backend.integration;

import static org.assertj.core.api.Assertions.*;

import com.example.backend.enums.Role;
import com.example.backend.service.IntegrationPorts;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.support.DefaultListableBeanFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

public class AuthenticationBoundaryTest {
    // Deliberately uses a different FQN from TV1, so it can never shadow production classes.
    public record PrincipalFixture(String id, Role role) {}

    private final CurrentActor actors = new CurrentActor(PrincipalFixture.class.getName());

    @AfterEach
    void clear() {
        SecurityContextHolder.clearContext();
    }

    private void authenticate(String id, Role role, String authority) {
        SecurityContextHolder.getContext()
                .setAuthentication(
                        new UsernamePasswordAuthenticationToken(
                                new PrincipalFixture(id, role),
                                null,
                                List.of(new SimpleGrantedAuthority(authority))));
    }

    @Test
    void rejectsMissingAuthentication() {
        assertThatThrownBy(() -> new CurrentActor().require(Role.PARTICIPANT))
                .hasMessageContaining("đăng nhập");
    }

    @Test
    void readsContractAndEnforcesAllowedRole() {
        authenticate("user-id", Role.PARTICIPANT, "ROLE_PARTICIPANT");
        assertThat(actors.require(Role.PARTICIPANT).id()).isEqualTo("user-id");
        assertThatThrownBy(() -> actors.require(Role.ORGANIZER))
                .hasMessageContaining("không có quyền");
    }

    @Test
    void productionResolverRejectsTestFixture() {
        authenticate("user-id", Role.PARTICIPANT, "ROLE_PARTICIPANT");
        assertThatThrownBy(() -> new CurrentActor().require(Role.PARTICIPANT))
                .hasMessageContaining("không tương thích");
    }

    @Test
    void rejectsMismatchedAuthorities() {
        authenticate("user-id", Role.ORGANIZER, "ROLE_PARTICIPANT");
        assertThatThrownBy(() -> actors.require(Role.ORGANIZER)).hasMessageContaining("không khớp");
    }

    @Test
    void rejectsMissingIdAndNullRole() {
        authenticate(" ", Role.PARTICIPANT, "ROLE_PARTICIPANT");
        assertThatThrownBy(() -> actors.require(Role.PARTICIPANT))
                .hasMessageContaining("định danh");
        authenticate("user-id", null, "ROLE_PARTICIPANT");
        assertThatThrownBy(() -> actors.require(Role.PARTICIPANT))
                .hasMessageContaining("không khớp");
    }

    @Test
    void rejectsUnauthenticatedToken() {
        SecurityContextHolder.getContext()
                .setAuthentication(
                        new UsernamePasswordAuthenticationToken(
                                new PrincipalFixture("user-id", Role.PARTICIPANT), null));
        assertThatThrownBy(() -> actors.require(Role.PARTICIPANT))
                .hasMessageContaining("đăng nhập");
    }

    @Test
    void rejectsGenericSpringPrincipal() {
        SecurityContextHolder.getContext()
                .setAuthentication(
                        new UsernamePasswordAuthenticationToken(
                                "untrusted-id",
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_PARTICIPANT"))));
        assertThatThrownBy(() -> actors.require(Role.PARTICIPANT))
                .hasMessageContaining("không tương thích");
    }

    @Test
    void missingTv2AdapterFailsClosed() {
        var beans = new DefaultListableBeanFactory();
        var ports = new IntegrationPorts(beans.getBeanProvider(ContestAccess.class));
        assertThatThrownBy(ports::contests).hasMessageContaining("Chưa tích hợp");
    }
}
