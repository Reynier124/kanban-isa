package com.proyecto.kanban.service.mapper;

import com.proyecto.kanban.domain.Issue;
import com.proyecto.kanban.domain.Label;
import com.proyecto.kanban.domain.Project;
import com.proyecto.kanban.domain.User;
import com.proyecto.kanban.service.dto.IssueDTO;
import com.proyecto.kanban.service.dto.LabelDTO;
import com.proyecto.kanban.service.dto.ProjectDTO;
import com.proyecto.kanban.service.dto.UserDTO;
import java.util.Set;
import java.util.stream.Collectors;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Issue} and its DTO {@link IssueDTO}.
 */
@Mapper(componentModel = "spring")
public interface IssueMapper extends EntityMapper<IssueDTO, Issue> {
    @Mapping(target = "user", source = "user", qualifiedByName = "userLogin")
    @Mapping(target = "labels", source = "labels", qualifiedByName = "labelNameSet")
    @Mapping(target = "project", source = "project", qualifiedByName = "projectName")
    IssueDTO toDto(Issue s);

    @Mapping(target = "removeLabel", ignore = true)
    Issue toEntity(IssueDTO issueDTO);

    @Named("userLogin")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "login", source = "login")
    UserDTO toDtoUserLogin(User user);

    @Named("labelName")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    LabelDTO toDtoLabelName(Label label);

    @Named("labelNameSet")
    default Set<LabelDTO> toDtoLabelNameSet(Set<Label> label) {
        return label.stream().map(this::toDtoLabelName).collect(Collectors.toSet());
    }

    @Named("projectName")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    ProjectDTO toDtoProjectName(Project project);
}
