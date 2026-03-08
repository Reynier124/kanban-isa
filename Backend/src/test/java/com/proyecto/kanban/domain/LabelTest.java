package com.proyecto.kanban.domain;

import static com.proyecto.kanban.domain.IssueTestSamples.*;
import static com.proyecto.kanban.domain.LabelTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.proyecto.kanban.web.rest.TestUtil;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

class LabelTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Label.class);
        Label label1 = getLabelSample1();
        Label label2 = new Label();
        assertThat(label1).isNotEqualTo(label2);

        label2.setId(label1.getId());
        assertThat(label1).isEqualTo(label2);

        label2 = getLabelSample2();
        assertThat(label1).isNotEqualTo(label2);
    }

    @Test
    void issueTest() {
        Label label = getLabelRandomSampleGenerator();
        Issue issueBack = getIssueRandomSampleGenerator();

        label.addIssue(issueBack);
        assertThat(label.getIssues()).containsOnly(issueBack);
        assertThat(issueBack.getLabels()).containsOnly(label);

        label.removeIssue(issueBack);
        assertThat(label.getIssues()).doesNotContain(issueBack);
        assertThat(issueBack.getLabels()).doesNotContain(label);

        label.issues(new HashSet<>(Set.of(issueBack)));
        assertThat(label.getIssues()).containsOnly(issueBack);
        assertThat(issueBack.getLabels()).containsOnly(label);

        label.setIssues(new HashSet<>());
        assertThat(label.getIssues()).doesNotContain(issueBack);
        assertThat(issueBack.getLabels()).doesNotContain(label);
    }
}
