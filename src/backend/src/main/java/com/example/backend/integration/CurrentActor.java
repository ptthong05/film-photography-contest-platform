package com.example.backend.integration;

import com.example.backend.enums.Role;
import com.example.backend.exception.Tv3Exception;

import org.springframework.context.annotation.Profile;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/** Reads only TV1's established AuthenticatedUser record; does not issue or verify JWTs. */
@Component
@Profile("tv3")
public class CurrentActor {
    private final String principalClassName;

    public CurrentActor() {
        this("com.example.backend.security.AuthenticatedUser");
    }

    // Package-private seam for contract fixtures; not configurable by requests or environment.
    CurrentActor(String principalClassName) {
        this.principalClassName = principalClassName;
    }

    public Actor require(Role... allowed) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() == null)
            throw new Tv3Exception(401, "Vui lòng đăng nhập bằng JWT của TV1");
        Object principal = auth.getPrincipal();
        if (!principal.getClass().getName().equals(principalClassName))
            throw new Tv3Exception(401, "Principal không tương thích hợp đồng TV1");
        try {
            String id = (String) principal.getClass().getMethod("id").invoke(principal);
            Role role = (Role) principal.getClass().getMethod("role").invoke(principal);
            if (id == null || id.isBlank())
                throw new Tv3Exception(401, "Thiếu định danh người dùng");
            if (role == null
                    || auth.getAuthorities().stream()
                            .noneMatch(
                                    authority ->
                                            authority.getAuthority().equals("ROLE_" + role.name())))
                throw new Tv3Exception(403, "Vai trò không khớp quyền xác thực của TV1");
            for (Role candidate : allowed) if (role == candidate) return new Actor(id, role);
            throw new Tv3Exception(403, "Bạn không có quyền thực hiện thao tác này");
        } catch (ReflectiveOperationException | ClassCastException e) {
            throw new Tv3Exception(401, "Principal không tương thích hợp đồng TV1");
        }
    }
}
