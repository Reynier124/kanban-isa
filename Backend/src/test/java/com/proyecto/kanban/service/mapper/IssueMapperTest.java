package com.proyecto.kanban.service.mapper;

import static com.proyecto.kanban.domain.IssueAsserts.*;
import static com.proyecto.kanban.domain.IssueTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class IssueMapperTest {

    private IssueMapper issueMapper;

    @BeforeEach
    void setUp() {
        issueMapper = new IssueMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getIssueSample1();
        var actual = issueMapper.toEntity(issueMapper.toDto(expected));
        assertIssueAllPropertiesEquals(expected, actual);
    }
}
