package com.proyecto.kanban.domain;

import static com.proyecto.kanban.domain.IssueTestSamples.*;
import static com.proyecto.kanban.domain.ProjectTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.proyecto.kanban.web.rest.TestUtil;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

class ProjectTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Project.class);
        Project project1 = getProjectSample1();
        Project project2 = new Project();
        assertThat(project1).isNotEqualTo(project2);

        project2.setId(project1.getId());
        assertThat(project1).isEqualTo(project2);

        project2 = getProjectSample2();
        assertThat(project1).isNotEqualTo(project2);
    }

    @Test
    void issueTest() {
        Project project = getProjectRandomSampleGenerator();
        Issue issueBack = getIssueRandomSampleGenerator();

        project.addIssue(issueBack);
        assertThat(project.getIssues()).containsOnly(issueBack);
        assertThat(issueBack.getProject()).isEqualTo(project);

        project.removeIssue(issueBack);
        assertThat(project.getIssues()).doesNotContain(issueBack);
        assertThat(issueBack.getProject()).isNull();

        project.issues(new HashSet<>(Set.of(issueBack)));
        assertThat(project.getIssues()).containsOnly(issueBack);
        assertThat(issueBack.getProject()).isEqualTo(project);

        project.setIssues(new HashSet<>());
        assertThat(project.getIssues()).doesNotContain(issueBack);
        assertThat(issueBack.getProject()).isNull();
    }
}
