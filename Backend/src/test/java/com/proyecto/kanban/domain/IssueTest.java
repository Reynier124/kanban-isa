package com.proyecto.kanban.domain;

import static com.proyecto.kanban.domain.IssueTestSamples.*;
import static com.proyecto.kanban.domain.LabelTestSamples.*;
import static com.proyecto.kanban.domain.ProjectTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.proyecto.kanban.web.rest.TestUtil;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

class IssueTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Issue.class);
        Issue issue1 = getIssueSample1();
        Issue issue2 = new Issue();
        assertThat(issue1).isNotEqualTo(issue2);

        issue2.setId(issue1.getId());
        assertThat(issue1).isEqualTo(issue2);

        issue2 = getIssueSample2();
        assertThat(issue1).isNotEqualTo(issue2);
    }

    @Test
    void labelTest() {
        Issue issue = getIssueRandomSampleGenerator();
        Label labelBack = getLabelRandomSampleGenerator();

        issue.addLabel(labelBack);
        assertThat(issue.getLabels()).containsOnly(labelBack);

        issue.removeLabel(labelBack);
        assertThat(issue.getLabels()).doesNotContain(labelBack);

        issue.labels(new HashSet<>(Set.of(labelBack)));
        assertThat(issue.getLabels()).containsOnly(labelBack);

        issue.setLabels(new HashSet<>());
        assertThat(issue.getLabels()).doesNotContain(labelBack);
    }

    @Test
    void projectTest() {
        Issue issue = getIssueRandomSampleGenerator();
        Project projectBack = getProjectRandomSampleGenerator();

        issue.setProject(projectBack);
        assertThat(issue.getProject()).isEqualTo(projectBack);

        issue.project(null);
        assertThat(issue.getProject()).isNull();
    }
}
