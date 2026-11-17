package com.chamas.academy.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.ObjectProvider;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DatabaseHealthServiceTest {

    @Mock
    private ObjectProvider<DataSource> dataSourceProvider;

    @Mock
    private DataSource dataSource;

    @Mock
    private Connection connection;

    @Test
    @DisplayName("checkDatabaseStatus returns NOT_CONFIGURED when no DataSource bean is available")
    void shouldReturnNotConfiguredWhenDataSourceAbsent() {
        when(dataSourceProvider.getIfAvailable()).thenReturn(null);

        DatabaseHealthService service = new DatabaseHealthService(dataSourceProvider);
        String status = service.checkDatabaseStatus();

        assertThat(status).isEqualTo("NOT_CONFIGURED");
    }

    @Test
    @DisplayName("checkDatabaseStatus returns CONNECTED when DataSource produces a valid connection")
    void shouldReturnConnectedWhenConnectionIsValid() throws Exception {
        when(dataSourceProvider.getIfAvailable()).thenReturn(dataSource);
        when(dataSource.getConnection()).thenReturn(connection);
        when(connection.isValid(2)).thenReturn(true);

        DatabaseHealthService service = new DatabaseHealthService(dataSourceProvider);
        String status = service.checkDatabaseStatus();

        assertThat(status).isEqualTo("CONNECTED");
        verify(connection).close();
    }

    @Test
    @DisplayName("checkDatabaseStatus returns DISCONNECTED when DataSource throws SQLException")
    void shouldReturnDisconnectedWhenSQLExceptionOccurs() throws Exception {
        when(dataSourceProvider.getIfAvailable()).thenReturn(dataSource);
        when(dataSource.getConnection()).thenThrow(new SQLException("Connection refused"));

        DatabaseHealthService service = new DatabaseHealthService(dataSourceProvider);
        String status = service.checkDatabaseStatus();

        assertThat(status).isEqualTo("DISCONNECTED");
    }

    @Test
    @DisplayName("checkDatabaseStatus returns DISCONNECTED when connection is closed or invalid")
    void shouldReturnDisconnectedWhenConnectionIsInvalid() throws Exception {
        when(dataSourceProvider.getIfAvailable()).thenReturn(dataSource);
        when(dataSource.getConnection()).thenReturn(connection);
        when(connection.isValid(2)).thenReturn(false);
        when(connection.isClosed()).thenReturn(true);

        DatabaseHealthService service = new DatabaseHealthService(dataSourceProvider);
        String status = service.checkDatabaseStatus();

        assertThat(status).isEqualTo("DISCONNECTED");
        verify(connection).close();
    }
}
