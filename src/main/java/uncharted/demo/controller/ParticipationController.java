package uncharted.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uncharted.demo.dto.ParticipationDto;
import uncharted.demo.service.ParticipationService;

import java.util.Map;

import java.util.List;

@RestController
@RequestMapping("/api/participations")
public class ParticipationController {

    private final ParticipationService participationService;

    public ParticipationController(ParticipationService participationService) {
        this.participationService = participationService;
    }

    @PostMapping("/join/{huntId}")
    public ResponseEntity<ParticipationDto.Response> join(
            @PathVariable Integer huntId,
            @RequestBody(required = false) ParticipationDto.JoinRequest body,
            Authentication auth) {
        String secretCode = body != null ? body.secretCode() : null;
        return ResponseEntity.ok(participationService.join(huntId, auth.getName(), secretCode));
    }

    @GetMapping("/mine")
    public ResponseEntity<List<ParticipationDto.Response>> getMyParticipations(Authentication auth) {
        return ResponseEntity.ok(participationService.getMyParticipations(auth.getName()));
    }
}
