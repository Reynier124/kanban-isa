package com.proyecto.kanban.web.rest;

import com.proyecto.kanban.repository.IssueRepository;
import com.proyecto.kanban.service.IssueService;
import com.proyecto.kanban.service.dto.IssueDTO;
import com.proyecto.kanban.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.proyecto.kanban.domain.Issue}.
 */
@RestController
@RequestMapping("/api/issues")
public class IssueResource {

    private static final Logger LOG = LoggerFactory.getLogger(IssueResource.class);

    private static final String ENTITY_NAME = "issue";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final IssueService issueService;

    private final IssueRepository issueRepository;

    public IssueResource(IssueService issueService, IssueRepository issueRepository) {
        this.issueService = issueService;
        this.issueRepository = issueRepository;
    }

    /**
     * {@code POST  /issues} : Create a new issue.
     *
     * @param issueDTO the issueDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new issueDTO, or with status {@code 400 (Bad Request)} if the issue has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<IssueDTO> createIssue(@Valid @RequestBody IssueDTO issueDTO) throws URISyntaxException {
        LOG.debug("REST request to save Issue : {}", issueDTO);
        if (issueDTO.getId() != null) {
            throw new BadRequestAlertException("A new issue cannot already have an ID", ENTITY_NAME, "idexists");
        }
        issueDTO = issueService.save(issueDTO);
        return ResponseEntity.created(new URI("/api/issues/" + issueDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, issueDTO.getId().toString()))
            .body(issueDTO);
    }

    /**
     * {@code PUT  /issues/:id} : Updates an existing issue.
     *
     * @param id the id of the issueDTO to save.
     * @param issueDTO the issueDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated issueDTO,
     * or with status {@code 400 (Bad Request)} if the issueDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the issueDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<IssueDTO> updateIssue(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody IssueDTO issueDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update Issue : {}, {}", id, issueDTO);
        if (issueDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, issueDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!issueRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        issueDTO = issueService.update(issueDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, issueDTO.getId().toString()))
            .body(issueDTO);
    }

    /**
     * {@code PATCH  /issues/:id} : Partial updates given fields of an existing issue, field will ignore if it is null
     *
     * @param id the id of the issueDTO to save.
     * @param issueDTO the issueDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated issueDTO,
     * or with status {@code 400 (Bad Request)} if the issueDTO is not valid,
     * or with status {@code 404 (Not Found)} if the issueDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the issueDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<IssueDTO> partialUpdateIssue(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody IssueDTO issueDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Issue partially : {}, {}", id, issueDTO);
        if (issueDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, issueDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!issueRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<IssueDTO> result = issueService.partialUpdate(issueDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, issueDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /issues} : get all the issues.
     *
     * @param pageable the pagination information.
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of issues in body.
     */
    @GetMapping("")
    public ResponseEntity<List<IssueDTO>> getAllIssues(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get a page of Issues");
        Page<IssueDTO> page;
        if (eagerload) {
            page = issueService.findAllWithEagerRelationships(pageable);
        } else {
            page = issueService.findAll(pageable);
        }
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /issues/:id} : get the "id" issue.
     *
     * @param id the id of the issueDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the issueDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<IssueDTO> getIssue(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Issue : {}", id);
        Optional<IssueDTO> issueDTO = issueService.findOne(id);
        return ResponseUtil.wrapOrNotFound(issueDTO);
    }

    /**
     * {@code DELETE  /issues/:id} : delete the "id" issue.
     *
     * @param id the id of the issueDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIssue(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Issue : {}", id);
        issueService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
