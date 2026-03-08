package com.proyecto.kanban.service.mapper;

import com.proyecto.kanban.domain.Issue;
import com.proyecto.kanban.domain.Label;
import com.proyecto.kanban.service.dto.IssueDTO;
import com.proyecto.kanban.service.dto.LabelDTO;
import java.util.Set;
import java.util.stream.Collectors;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Label} and its DTO {@link LabelDTO}.
 */
@Mapper(componentModel = "spring")
public interface LabelMapper extends EntityMapper<LabelDTO, Label> {
    @Mapping(target = "issues", source = "issues", qualifiedByName = "issueIdSet")
    LabelDTO toDto(Label s);

    @Mapping(target = "issues", ignore = true)
    @Mapping(target = "removeIssue", ignore = true)
    Label toEntity(LabelDTO labelDTO);

    @Named("issueId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    IssueDTO toDtoIssueId(Issue issue);

    @Named("issueIdSet")
    default Set<IssueDTO> toDtoIssueIdSet(Set<Issue> issue) {
        return issue.stream().map(this::toDtoIssueId).collect(Collectors.toSet());
    }
}
