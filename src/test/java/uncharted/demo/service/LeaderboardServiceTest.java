package uncharted.demo.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uncharted.demo.dto.LeaderboardDto;
import uncharted.demo.model.*;
import uncharted.demo.repository.ParticipationRepository;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LeaderboardServiceTest {

    @Mock
    private ParticipationRepository participationRepository;

    @InjectMocks
    private LeaderboardService leaderboardService;

    @Test
    void getGlobalLeaderboard_shouldReturnSortedByScore() {
        User user1 = new User();
        user1.setPseudo("Player1");
        User user2 = new User();
        user2.setPseudo("Player2");

        Hunt hunt = new Hunt();
        hunt.setId(1);

        Participation p1 = new Participation();
        p1.setUser(user1);
        p1.setHunt(hunt);
        p1.setScore(50);
        p1.setStatus(Status.FINISHED);

        Participation p2 = new Participation();
        p2.setUser(user2);
        p2.setHunt(hunt);
        p2.setScore(100);
        p2.setStatus(Status.IN_PROGRESS);

        when(participationRepository.findAll()).thenReturn(List.of(p1, p2));

        List<LeaderboardDto.Entry> result = leaderboardService.getGlobalLeaderboard();

        assertEquals(2, result.size());
        assertEquals("Player2", result.get(0).pseudo());
        assertEquals(100, result.get(0).totalScore());
        assertEquals("Player1", result.get(1).pseudo());
    }

    @Test
    void getGlobalLeaderboard_shouldReturnEmpty_whenNoParticipations() {
        when(participationRepository.findAll()).thenReturn(List.of());
        List<LeaderboardDto.Entry> result = leaderboardService.getGlobalLeaderboard();
        assertTrue(result.isEmpty());
    }

    @Test
    void getHuntLeaderboard_shouldReturnPlayersForHunt() {
        User user = new User();
        user.setPseudo("Hunter");

        Participation p = new Participation();
        p.setUser(user);
        p.setScore(30);
        p.setStatus(Status.IN_PROGRESS);

        when(participationRepository.findByHuntId(1)).thenReturn(List.of(p));

        List<LeaderboardDto.Entry> result = leaderboardService.getHuntLeaderboard(1);

        assertEquals(1, result.size());
        assertEquals("Hunter", result.get(0).pseudo());
        assertEquals(30, result.get(0).totalScore());
    }
}
