package com.proyecto.kanban.service.dto;

import com.proyecto.kanban.domain.enumeration.IssueStatus;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

/**
 * A DTO for the {@link com.proyecto.kanban.domain.Issue} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class IssueDTO implements Serializable {

    private Long id;

    @NotNull
    private String title;

    private String description;

    private IssueStatus status;

    private UserDTO user;

    private Set<LabelDTO> labels = new HashSet<>();

    private ProjectDTO project;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public IssueStatus getStatus() {
        return status;
    }

    public void setStatus(IssueStatus status) {
        this.status = status;
    }

    public UserDTO getUser() {
        return user;
    }

    public void setUser(UserDTO user) {
        this.user = user;
    }

    public Set<LabelDTO> getLabels() {
        return labels;
    }

    public void setLabels(Set<LabelDTO> labels) {
        this.labels = labels;
    }

    public ProjectDTO getProject() {
        return project;
    }

    public void setProject(ProjectDTO project) {
        this.project = project;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof IssueDTO)) {
            return false;
        }

        IssueDTO issueDTO = (IssueDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, issueDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "IssueDTO{" +
            "id=" + getId() +
            ", title='" + getTitle() + "'" +
            ", description='" + getDescription() + "'" +
            ", status='" + getStatus() + "'" +
            ", user=" + getUser() +
            ", labels=" + getLabels() +
            ", project=" + getProject() +
            "}";
    }
}
