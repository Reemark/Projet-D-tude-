package uncharted.demo.dto;

import java.time.LocalDateTime;

public class UserProgressDto {

    public record Response(
            Integer id,
            Integer stepId,
            int stepOrder,
            boolean completed,
            LocalDateTime completedAt
    ) {}
}
