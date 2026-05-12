package uncharted.demo.service;

import org.springframework.stereotype.Service;
import uncharted.demo.dto.LeaderboardDto;
import uncharted.demo.model.Participation;
import uncharted.demo.model.Status;
import uncharted.demo.repository.ParticipationRepository;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class LeaderboardService {

    private final ParticipationRepository participationRepository;

    public LeaderboardService(ParticipationRepository participationRepository) {
        this.participationRepository = participationRepository;
    }

    public List<LeaderboardDto.Entry> getGlobalLeaderboard() {
        List<Participation> all = participationRepository.findAll();

        Map<String, List<Participation>> byUser = all.stream()
                .collect(Collectors.groupingBy(p -> p.getUser().getPseudo()));

        return byUser.entrySet().stream()
                .map(entry -> {
                    int totalScore = entry.getValue().stream().mapToInt(Participation::getScore).sum();
                    int completed = (int) entry.getValue().stream()
                            .filter(p -> p.getStatus() == Status.FINISHED).count();
                    return new LeaderboardDto.Entry(entry.getKey(), totalScore, completed);
                })
                .sorted((a, b) -> Integer.compare(b.totalScore(), a.totalScore()))
                .limit(50)
                .toList();
    }

    public List<LeaderboardDto.Entry> getHuntLeaderboard(Integer huntId) {
        List<Participation> participations = participationRepository.findByHuntId(huntId);

        return participations.stream()
                .map(p -> new LeaderboardDto.Entry(
                        p.getUser().getPseudo(),
                        p.getScore(),
                        p.getStatus() == Status.FINISHED ? 1 : 0))
                .sorted((a, b) -> Integer.compare(b.totalScore(), a.totalScore()))
                .toList();
    }
}
