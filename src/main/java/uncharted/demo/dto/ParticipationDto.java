package uncharted.demo.dto;

import uncharted.demo.model.Status;

import java.time.LocalDateTime;

public class ParticipationDto {

    public record JoinRequest(String secretCode) {}

    public record Response(
            Integer id,
            Integer huntId,
            String huntTitle,
            String userPseudo,
            Status status,
            int score,
            LocalDateTime createdAt
    ) {}
}
