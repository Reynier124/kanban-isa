package com.proyecto.kanban.service.mapper;

import com.proyecto.kanban.domain.Project;
import com.proyecto.kanban.service.dto.ProjectDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Project} and its DTO {@link ProjectDTO}.
 */
@Mapper(componentModel = "spring")
public interface ProjectMapper extends EntityMapper<ProjectDTO, Project> {}
