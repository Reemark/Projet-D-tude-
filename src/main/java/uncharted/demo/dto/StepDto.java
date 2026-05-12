package uncharted.demo.dto;

import jakarta.validation.constraints.NotNull;
import uncharted.demo.model.ArContent;

public class StepDto {

    public record CreateRequest(
            @NotNull Integer huntId,
            @NotNull Integer stepOrder,
            @NotNull Double latitude,
            @NotNull Double longitude,
            ArContent arContent,
            String clue,
            int score
    ) {}

    public record Response(
            Integer id,
            Integer huntId,
            int stepOrder,
            double latitude,
            double longitude,
            ArContent arContent,
            String clue,
            int score
    ) {}
}
