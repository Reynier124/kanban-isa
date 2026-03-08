package com.proyecto.kanban.repository;

import com.proyecto.kanban.domain.Issue;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Issue entity.
 *
 * When extending this class, extend IssueRepositoryWithBagRelationships too.
 * For more information refer to https://github.com/jhipster/generator-jhipster/issues/17990.
 */
@Repository
public interface IssueRepository extends IssueRepositoryWithBagRelationships, JpaRepository<Issue, Long> {
    @Query("select issue from Issue issue where issue.user.login = ?#{authentication.name}")
    List<Issue> findByUserIsCurrentUser();

    default Optional<Issue> findOneWithEagerRelationships(Long id) {
        return this.fetchBagRelationships(this.findOneWithToOneRelationships(id));
    }

    default List<Issue> findAllWithEagerRelationships() {
        return this.fetchBagRelationships(this.findAllWithToOneRelationships());
    }

    default Page<Issue> findAllWithEagerRelationships(Pageable pageable) {
        return this.fetchBagRelationships(this.findAllWithToOneRelationships(pageable));
    }

    @Query(
        value = "select issue from Issue issue left join fetch issue.user left join fetch issue.project",
        countQuery = "select count(issue) from Issue issue"
    )
    Page<Issue> findAllWithToOneRelationships(Pageable pageable);

    @Query("select issue from Issue issue left join fetch issue.user left join fetch issue.project")
    List<Issue> findAllWithToOneRelationships();

    @Query("select issue from Issue issue left join fetch issue.user left join fetch issue.project where issue.id =:id")
    Optional<Issue> findOneWithToOneRelationships(@Param("id") Long id);
}
