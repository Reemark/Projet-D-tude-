package uncharted.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uncharted.demo.dto.UserProgressDto;
import uncharted.demo.service.UserProgressService;

import java.util.List;

@RestController
@RequestMapping("/api/progress")
public class UserProgressController {

    private final UserProgressService userProgressService;

    public UserProgressController(UserProgressService userProgressService) {
        this.userProgressService = userProgressService;
    }

    @PostMapping("/dig/{stepId}")
    public ResponseEntity<UserProgressDto.Response> dig(@PathVariable Integer stepId, Authentication auth) {
        return ResponseEntity.ok(userProgressService.dig(stepId, auth.getName()));
    }

    @GetMapping("/hunt/{huntId}")
    public ResponseEntity<List<UserProgressDto.Response>> getProgress(@PathVariable Integer huntId,
                                                                      Authentication auth) {
        return ResponseEntity.ok(userProgressService.getProgress(huntId, auth.getName()));
    }
}
