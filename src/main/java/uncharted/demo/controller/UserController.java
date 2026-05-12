package uncharted.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uncharted.demo.dto.UserDto;
import uncharted.demo.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto.Response> getProfile(Authentication auth) {
        return ResponseEntity.ok(userService.getProfile(auth.getName()));
    }

    @PatchMapping("/me/pseudo")
    public ResponseEntity<UserDto.Response> updatePseudo(Authentication auth, @RequestBody String pseudo) {
        return ResponseEntity.ok(userService.updatePseudo(auth.getName(), pseudo));
    }
}
