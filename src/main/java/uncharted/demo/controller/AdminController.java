package uncharted.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import uncharted.demo.dto.UserDto;
import uncharted.demo.service.AdminService;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDto.Response>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PatchMapping("/users/{id}/deactivate")
    public ResponseEntity<UserDto.Response> deactivateUser(@PathVariable Integer id) {
        return ResponseEntity.ok(adminService.deactivateUser(id));
    }

    @PatchMapping("/users/{id}/activate")
    public ResponseEntity<UserDto.Response> activateUser(@PathVariable Integer id) {
        return ResponseEntity.ok(adminService.activateUser(id));
    }

    @PatchMapping("/users/{id}/verify-siret")
    public ResponseEntity<UserDto.Response> verifySiret(@PathVariable Integer id) {
        return ResponseEntity.ok(adminService.verifySiret(id));
    }
}
