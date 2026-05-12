package uncharted.demo.dto;

import uncharted.demo.model.Role;

import java.time.LocalDateTime;

public class UserDto {

    public record Response(
            Integer id,
            String email,
            String pseudo,
            Role role,
            boolean isActive,
            boolean emailVerified,
            LocalDateTime createdAt
    ) {}
}
