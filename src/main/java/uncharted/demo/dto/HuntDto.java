package uncharted.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import uncharted.demo.model.Difficulty;

import java.time.LocalDateTime;

public class HuntDto {

    public record CreateRequest(
            @NotBlank String title,
            String description,
            @NotNull Difficulty difficulty,
            String secretCode
    ) {}

    public record Response(
            Integer id,
            String title,
            String description,
            Difficulty difficulty,
            String creatorPseudo,
            boolean isActive,
            boolean isPrivate,
            LocalDateTime createdAt
    ) {}
}
