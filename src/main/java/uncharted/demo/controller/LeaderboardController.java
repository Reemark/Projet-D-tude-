package uncharted.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uncharted.demo.dto.LeaderboardDto;
import uncharted.demo.service.LeaderboardService;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    public LeaderboardController(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    @GetMapping
    public ResponseEntity<List<LeaderboardDto.Entry>> getGlobal() {
        return ResponseEntity.ok(leaderboardService.getGlobalLeaderboard());
    }

    @GetMapping("/hunt/{huntId}")
    public ResponseEntity<List<LeaderboardDto.Entry>> getByHunt(@PathVariable Integer huntId) {
        return ResponseEntity.ok(leaderboardService.getHuntLeaderboard(huntId));
    }
}
