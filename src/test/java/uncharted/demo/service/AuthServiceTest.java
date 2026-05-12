package uncharted.demo.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import uncharted.demo.dto.AuthDto;
import uncharted.demo.exception.BadRequestException;
import uncharted.demo.model.Role;
import uncharted.demo.model.User;
import uncharted.demo.repository.UserRepository;
import uncharted.demo.security.JwtService;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private UserDetailsService userDetailsService;

    @InjectMocks
    private AuthService authService;

    private AuthDto.RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        registerRequest = new AuthDto.RegisterRequest("test@test.com", "123456", "TestUser");
    }

    @Test
    void register_shouldReturnToken_whenEmailIsNew() {
        when(userRepository.existsByEmail("test@test.com")).thenReturn(false);
        when(passwordEncoder.encode("123456")).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        UserDetails mockUserDetails = new org.springframework.security.core.userdetails.User(
                "test@test.com", "encoded", Collections.emptyList());
        when(userDetailsService.loadUserByUsername("test@test.com")).thenReturn(mockUserDetails);
        when(jwtService.generateToken(mockUserDetails)).thenReturn("jwt-token");

        AuthDto.AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("jwt-token", response.token());
        assertEquals("test@test.com", response.email());
        assertEquals("TestUser", response.pseudo());
        assertEquals("USER", response.role());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_shouldThrow_whenEmailExists() {
        when(userRepository.existsByEmail("test@test.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any());
    }

    @Test
    void login_shouldReturnToken_whenCredentialsValid() {
        AuthDto.LoginRequest loginRequest = new AuthDto.LoginRequest("test@test.com", "123456");

        User user = new User();
        user.setEmail("test@test.com");
        user.setPseudo("TestUser");
        user.setRole(Role.USER);

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));

        UserDetails mockUserDetails = new org.springframework.security.core.userdetails.User(
                "test@test.com", "encoded", Collections.emptyList());
        when(userDetailsService.loadUserByUsername("test@test.com")).thenReturn(mockUserDetails);
        when(jwtService.generateToken(mockUserDetails)).thenReturn("jwt-token");

        AuthDto.AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("jwt-token", response.token());
        assertEquals("USER", response.role());
    }
}
