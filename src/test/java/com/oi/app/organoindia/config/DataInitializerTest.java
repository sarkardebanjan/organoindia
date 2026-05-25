package com.oi.app.organoindia.config;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doCallRealMethod;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import com.oi.app.organoindia.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
public class DataInitializerTest {

    @Test
    public void test() {
        DataInitializer dataInitializer = Mockito.mock(DataInitializer.class);
        ReflectionTestUtils.setField(dataInitializer, "userRepository", Mockito.mock(UserRepository.class));
        ReflectionTestUtils.setField(dataInitializer, "passwordEncoder", Mockito.mock(PasswordEncoder.class));
        doCallRealMethod().when(dataInitializer).run(any());
        dataInitializer.run(null);
    }
}
