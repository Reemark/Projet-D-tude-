package uncharted.demo.dto;

public class LeaderboardDto {

    public record Entry(
            String pseudo,
            int totalScore,
            int huntsCompleted
    ) {}
}
