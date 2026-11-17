package com.chamas.academy;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import javax.sql.DataSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class H2DatabaseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired(required = false)
    private DataSource dataSource;

    @Test
    @DisplayName("In test profile with DataSource enabled, DataSource bean is loaded and connected")
    void shouldLoadDataSourceBeanInTestProfile() {
        assertThat(dataSource).isNotNull();
    }

    @Test
    @DisplayName("GET /api/health returns CONNECTED database status when DataSource is active")
    void shouldReturnConnectedDatabaseStatusWhenDataSourceActive() throws Exception {
        mockMvc.perform(get("/api/health")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.database").value("CONNECTED"))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.username").doesNotExist());
    }
}
