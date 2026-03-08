package com.proyecto.kanban.repository;

import com.proyecto.kanban.domain.Issue;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.stream.IntStream;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

/**
 * Utility repository to load bag relationships based on https://vladmihalcea.com/hibernate-multiplebagfetchexception/
 */
public class IssueRepositoryWithBagRelationshipsImpl implements IssueRepositoryWithBagRelationships {

    private static final String ID_PARAMETER = "id";
    private static final String ISSUES_PARAMETER = "issues";

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Optional<Issue> fetchBagRelationships(Optional<Issue> issue) {
        return issue.map(this::fetchLabels);
    }

    @Override
    public Page<Issue> fetchBagRelationships(Page<Issue> issues) {
        return new PageImpl<>(fetchBagRelationships(issues.getContent()), issues.getPageable(), issues.getTotalElements());
    }

    @Override
    public List<Issue> fetchBagRelationships(List<Issue> issues) {
        return Optional.of(issues).map(this::fetchLabels).orElse(Collections.emptyList());
    }

    Issue fetchLabels(Issue result) {
        return entityManager
            .createQuery("select issue from Issue issue left join fetch issue.labels where issue.id = :id", Issue.class)
            .setParameter(ID_PARAMETER, result.getId())
            .getSingleResult();
    }

    List<Issue> fetchLabels(List<Issue> issues) {
        HashMap<Object, Integer> order = new HashMap<>();
        IntStream.range(0, issues.size()).forEach(index -> order.put(issues.get(index).getId(), index));
        List<Issue> result = entityManager
            .createQuery("select issue from Issue issue left join fetch issue.labels where issue in :issues", Issue.class)
            .setParameter(ISSUES_PARAMETER, issues)
            .getResultList();
        Collections.sort(result, (o1, o2) -> Integer.compare(order.get(o1.getId()), order.get(o2.getId())));
        return result;
    }
}
