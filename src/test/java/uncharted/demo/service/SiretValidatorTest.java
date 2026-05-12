package uncharted.demo.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SiretValidatorTest {

    @Test
    void isValid_shouldReturnTrue_forValidSiret() {
        assertTrue(SiretValidator.isValid("73282932000074"));
        assertTrue(SiretValidator.isValid("44306184100047"));
        assertTrue(SiretValidator.isValid("35600000000048"));
    }

    @Test
    void isValid_shouldReturnFalse_forRandomDigits() {
        assertFalse(SiretValidator.isValid("12345678901234"));
        assertFalse(SiretValidator.isValid("00000000000001"));
    }

    @Test
    void isValid_shouldReturnFalse_forNull() {
        assertFalse(SiretValidator.isValid(null));
    }

    @Test
    void isValid_shouldReturnFalse_forWrongLength() {
        assertFalse(SiretValidator.isValid("1234567890"));
        assertFalse(SiretValidator.isValid("123456789012345"));
    }

    @Test
    void isValid_shouldReturnFalse_forNonNumeric() {
        assertFalse(SiretValidator.isValid("7328293200007A"));
        assertFalse(SiretValidator.isValid("abcdefghijklmn"));
    }
}
