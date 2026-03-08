package com.proyecto.kanban.repository;

import com.proyecto.kanban.domain.Issue;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;

public interface IssueRepositoryWithBagRelationships {
    Optional<Issue> fetchBagRelationships(Optional<Issue> issue);

    List<Issue> fetchBagRelationships(List<Issue> issues);

    Page<Issue> fetchBagRelationships(Page<Issue> issues);
}
