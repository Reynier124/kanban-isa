package com.proyecto.kanban.web.rest;

import static com.proyecto.kanban.domain.IssueAsserts.*;
import static com.proyecto.kanban.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.proyecto.kanban.IntegrationTest;
import com.proyecto.kanban.domain.Issue;
import com.proyecto.kanban.domain.enumeration.IssueStatus;
import com.proyecto.kanban.repository.IssueRepository;
import com.proyecto.kanban.repository.UserRepository;
import com.proyecto.kanban.service.IssueService;
import com.proyecto.kanban.service.dto.IssueDTO;
import com.proyecto.kanban.service.mapper.IssueMapper;
import jakarta.persistence.EntityManager;
import java.util.ArrayList;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link IssueResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class IssueResourceIT {

    private static final String DEFAULT_TITLE = "AAAAAAAAAA";
    private static final String UPDATED_TITLE = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final IssueStatus DEFAULT_STATUS = IssueStatus.OPEN;
    private static final IssueStatus UPDATED_STATUS = IssueStatus.IN_PROGRESS;

    private static final String ENTITY_API_URL = "/api/issues";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private UserRepository userRepository;

    @Mock
    private IssueRepository issueRepositoryMock;

    @Autowired
    private IssueMapper issueMapper;

    @Mock
    private IssueService issueServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restIssueMockMvc;

    private Issue issue;

    private Issue insertedIssue;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Issue createEntity() {
        return new Issue().title(DEFAULT_TITLE).description(DEFAULT_DESCRIPTION).status(DEFAULT_STATUS);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Issue createUpdatedEntity() {
        return new Issue().title(UPDATED_TITLE).description(UPDATED_DESCRIPTION).status(UPDATED_STATUS);
    }

    @BeforeEach
    void initTest() {
        issue = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedIssue != null) {
            issueRepository.delete(insertedIssue);
            insertedIssue = null;
        }
    }

    @Test
    @Transactional
    void createIssue() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Issue
        IssueDTO issueDTO = issueMapper.toDto(issue);
        var returnedIssueDTO = om.readValue(
            restIssueMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(issueDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            IssueDTO.class
        );

        // Validate the Issue in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedIssue = issueMapper.toEntity(returnedIssueDTO);
        assertIssueUpdatableFieldsEquals(returnedIssue, getPersistedIssue(returnedIssue));

        insertedIssue = returnedIssue;
    }

    @Test
    @Transactional
    void createIssueWithExistingId() throws Exception {
        // Create the Issue with an existing ID
        issue.setId(1L);
        IssueDTO issueDTO = issueMapper.toDto(issue);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restIssueMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(issueDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Issue in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkTitleIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        issue.setTitle(null);

        // Create the Issue, which fails.
        IssueDTO issueDTO = issueMapper.toDto(issue);

        restIssueMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(issueDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllIssues() throws Exception {
        // Initialize the database
        insertedIssue = issueRepository.saveAndFlush(issue);

        // Get all the issueList
        restIssueMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(issue.getId().intValue())))
            .andExpect(jsonPath("$.[*].title").value(hasItem(DEFAULT_TITLE)))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS.toString())));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllIssuesWithEagerRelationshipsIsEnabled() throws Exception {
        when(issueServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restIssueMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(issueServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllIssuesWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(issueServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restIssueMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(issueRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getIssue() throws Exception {
        // Initialize the database
        insertedIssue = issueRepository.saveAndFlush(issue);

        // Get the issue
        restIssueMockMvc
            .perform(get(ENTITY_API_URL_ID, issue.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(issue.getId().intValue()))
            .andExpect(jsonPath("$.title").value(DEFAULT_TITLE))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION))
            .andExpect(jsonPath("$.status").value(DEFAULT_STATUS.toString()));
    }

    @Test
    @Transactional
    void getNonExistingIssue() throws Exception {
        // Get the issue
        restIssueMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingIssue() throws Exception {
        // Initialize the database
        insertedIssue = issueRepository.saveAndFlush(issue);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the issue
        Issue updatedIssue = issueRepository.findById(issue.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedIssue are not directly saved in db
        em.detach(updatedIssue);
        updatedIssue.title(UPDATED_TITLE).description(UPDATED_DESCRIPTION).status(UPDATED_STATUS);
        IssueDTO issueDTO = issueMapper.toDto(updatedIssue);

        restIssueMockMvc
            .perform(
                put(ENTITY_API_URL_ID, issueDTO.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(issueDTO))
            )
            .andExpect(status().isOk());

        // Validate the Issue in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedIssueToMatchAllProperties(updatedIssue);
    }

    @Test
    @Transactional
    void putNonExistingIssue() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        issue.setId(longCount.incrementAndGet());

        // Create the Issue
        IssueDTO issueDTO = issueMapper.toDto(issue);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restIssueMockMvc
            .perform(
                put(ENTITY_API_URL_ID, issueDTO.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(issueDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Issue in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchIssue() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        issue.setId(longCount.incrementAndGet());

        // Create the Issue
        IssueDTO issueDTO = issueMapper.toDto(issue);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restIssueMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(issueDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Issue in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamIssue() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        issue.setId(longCount.incrementAndGet());

        // Create the Issue
        IssueDTO issueDTO = issueMapper.toDto(issue);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restIssueMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(issueDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Issue in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateIssueWithPatch() throws Exception {
        // Initialize the database
        insertedIssue = issueRepository.saveAndFlush(issue);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the issue using partial update
        Issue partialUpdatedIssue = new Issue();
        partialUpdatedIssue.setId(issue.getId());

        partialUpdatedIssue.title(UPDATED_TITLE).description(UPDATED_DESCRIPTION);

        restIssueMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedIssue.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedIssue))
            )
            .andExpect(status().isOk());

        // Validate the Issue in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertIssueUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedIssue, issue), getPersistedIssue(issue));
    }

    @Test
    @Transactional
    void fullUpdateIssueWithPatch() throws Exception {
        // Initialize the database
        insertedIssue = issueRepository.saveAndFlush(issue);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the issue using partial update
        Issue partialUpdatedIssue = new Issue();
        partialUpdatedIssue.setId(issue.getId());

        partialUpdatedIssue.title(UPDATED_TITLE).description(UPDATED_DESCRIPTION).status(UPDATED_STATUS);

        restIssueMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedIssue.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedIssue))
            )
            .andExpect(status().isOk());

        // Validate the Issue in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertIssueUpdatableFieldsEquals(partialUpdatedIssue, getPersistedIssue(partialUpdatedIssue));
    }

    @Test
    @Transactional
    void patchNonExistingIssue() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        issue.setId(longCount.incrementAndGet());

        // Create the Issue
        IssueDTO issueDTO = issueMapper.toDto(issue);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restIssueMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, issueDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(issueDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Issue in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchIssue() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        issue.setId(longCount.incrementAndGet());

        // Create the Issue
        IssueDTO issueDTO = issueMapper.toDto(issue);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restIssueMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(issueDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Issue in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamIssue() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        issue.setId(longCount.incrementAndGet());

        // Create the Issue
        IssueDTO issueDTO = issueMapper.toDto(issue);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restIssueMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(issueDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Issue in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteIssue() throws Exception {
        // Initialize the database
        insertedIssue = issueRepository.saveAndFlush(issue);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the issue
        restIssueMockMvc
            .perform(delete(ENTITY_API_URL_ID, issue.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return issueRepository.count();
    }

    protected void assertIncrementedRepositoryCount(long countBefore) {
        assertThat(countBefore + 1).isEqualTo(getRepositoryCount());
    }

    protected void assertDecrementedRepositoryCount(long countBefore) {
        assertThat(countBefore - 1).isEqualTo(getRepositoryCount());
    }

    protected void assertSameRepositoryCount(long countBefore) {
        assertThat(countBefore).isEqualTo(getRepositoryCount());
    }

    protected Issue getPersistedIssue(Issue issue) {
        return issueRepository.findById(issue.getId()).orElseThrow();
    }

    protected void assertPersistedIssueToMatchAllProperties(Issue expectedIssue) {
        assertIssueAllPropertiesEquals(expectedIssue, getPersistedIssue(expectedIssue));
    }

    protected void assertPersistedIssueToMatchUpdatableProperties(Issue expectedIssue) {
        assertIssueAllUpdatablePropertiesEquals(expectedIssue, getPersistedIssue(expectedIssue));
    }
}
