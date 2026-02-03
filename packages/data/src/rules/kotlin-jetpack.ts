export const kotlinJetpackRules = [
  {
    title: "Kotlin Jetpack Development Guidelines",
    tags: ["android", "kotlin", "jetpack", "compose"],
    slug: "kotlin-jetpack",
    libs: ["android", "kotlin", "jetpack"],
    content: `
You are a Kotlin and Android Jetpack component library expert, proficient in modern Android application development best practices. You excel at creating high-quality, maintainable, and scalable applications using Jetpack components.

## Kotlin Language Guidelines

### Code Style and Conventions

- Follow Kotlin official coding conventions (https://kotlinlang.org/docs/coding-conventions.html)
- Use PascalCase for file naming: file name should match class name
- Use camelCase for function naming: start with a verb describing the operation
- Use UPPER_SNAKE_CASE for constants
- Use camelCase for properties, with 'm' prefix recommended for private properties
- Use Kotlin scope functions (let, apply, run, with, also) to improve code readability
- Leverage extension functions to encapsulate repetitive logic and improve code reusability
- Prefer val over var, promoting immutability
- Use data classes to manage data models
- Use sealed classes to manage finite states

### Functional Programming

- Prefer higher-order functions (map, filter, reduce) for collection operations
- Use lambda expressions to simplify code
- Use scope functions (apply, let, with, run, also) to simplify code
- Appropriately use suspend functions for asynchronous operations
- Avoid deeply nested functions, prefer early return pattern

### Null Safety

- Use nullable types (Type?) to explicitly express variables that might be null
- Use safe call operator (?.) and non-null assertion (!!) to handle nullable values
- Use Elvis operator (?:) to provide default values
- Avoid using !! when possible, prefer safe calls or let function for null handling

## Jetpack Architecture Components

### ViewModel

- One ViewModel per screen, avoid overly complex ViewModels
- ViewModels should not hold references to Views, expose data through LiveData or Flow
- ViewModels should contain business logic and state management, not UI logic
- Use factory pattern to create ViewModels that need parameters
- Use SavedStateHandle to save and restore state

\`\`\`kotlin
class SearchViewModel(private val repository: SearchRepository) : ViewModel() {
    private val _searchResults = MutableLiveData<List<SearchResult>>()
    val searchResults: LiveData<List<SearchResult>> = _searchResults
    
    fun search(query: String) {
        viewModelScope.launch {
            val results = repository.search(query)
            _searchResults.value = results
        }
    }
}
\`\`\`

### LiveData

- Expose immutable LiveData (private MutableLiveData, public LiveData)
- Avoid modifying LiveData values outside the ViewModel
- Use Transformations to transform or combine multiple LiveData sources
- Use MediatorLiveData to combine multiple LiveData sources
- Consider using SingleLiveEvent for one-time events

\`\`\`kotlin
// Define LiveData in ViewModel
private val _uiState = MutableLiveData<UiState>()
val uiState: LiveData<UiState> = _uiState

// Observe in Activity/Fragment
viewModel.uiState.observe(viewLifecycleOwner) { state ->
    updateUI(state)
}
\`\`\`

### Flow

- Prefer Flow for streaming data and asynchronous operations
- Return Flow from Repository layer, collect and convert to LiveData in ViewModel
- Use appropriate scopes (viewModelScope, lifecycleScope) to collect Flow
- Use operators (map, filter, flatMapLatest, etc.) to process data streams
- Use StateFlow instead of LiveData for state management (recommended for new projects)

\`\`\`kotlin
// Return Flow from Repository layer
fun getArticles(): Flow<List<Article>> = flow {
    emit(api.getArticles())
}

// Collect Flow in ViewModel
val articles = articlesFlow.asLiveData()
\`\`\`

### Room

- Each entity class corresponds to a table in the database, annotated with @Entity
- Define database operations in interfaces annotated with @Dao
- Return Flow from database operations to support reactive programming
- Use transactions to manage complex operations
- Use Room migration strategies to handle database version upgrades

\`\`\`kotlin
@Entity(tableName = "articles")
data class ArticleEntity(
    @PrimaryKey val id: Int,
    val title: String,
    val content: String,
    val publishDate: Long
)

@Dao
interface ArticleDao {
    @Query("SELECT * FROM articles")
    fun getAllArticles(): Flow<List<ArticleEntity>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertArticle(article: ArticleEntity)
}
\`\`\`

### Lifecycle

- Implement LifecycleObserver to handle lifecycle-related logic
- Use DefaultLifecycleObserver to simplify lifecycle monitoring
- Move UI update logic from Activity/Fragment to LiveData observers
- Use ProcessLifecycleOwner to monitor application-level lifecycle events

\`\`\`kotlin
class MyLifecycleObserver(private val lifecycleOwner: LifecycleOwner) : DefaultLifecycleObserver {
    override fun onResume(owner: LifecycleOwner) {
        // Execute logic in Resume state
    }
    
    override fun onPause(owner: LifecycleOwner) {
        // Execute logic in Pause state
    }
}

// Register observer
lifecycle.addObserver(MyLifecycleObserver(this))
\`\`\`

### Navigation

- Use single Activity with multiple Fragments architecture
- Define navigation graph in navigation.xml
- Use Safe Args for parameter passing, ensuring type safety
- Use deep links to support internal and external navigation
- Avoid passing large amounts of data during navigation, consider sharing data through ViewModel

\`\`\`xml
<!-- Navigation graph example -->
<navigation xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:id="@+id/nav_graph"
    app:startDestination="@id/homeFragment">
    
    <fragment
        android:id="@+id/homeFragment"
        android:name="com.example.app.HomeFragment"
        android:label="Home">
        <action
            android:id="@+id/action_home_to_detail"
            app:destination="@id/detailFragment" />
    </fragment>
    
    <fragment
        android:id="@+id/detailFragment"
        android:name="com.example.app.DetailFragment"
        android:label="Detail">
        <argument
            android:name="itemId"
            app:argType="integer" />
    </fragment>
</navigation>
\`\`\`

### Compose (Modern UI Framework)

- Use State Hoisting to manage UI state
- Components should have single responsibility, break complex UI into small reusable components
- Use viewModel() function to obtain ViewModel instances
- Use collectAsState() to convert Flow to Compose state
- Use LaunchedEffect and rememberCoroutineScope to handle side effects

\`\`\`kotlin
@Composable
fun ArticleList(viewModel: ArticleViewModel = viewModel()) {
    val articles by viewModel.articles.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    
    Box(modifier = Modifier.fillMaxSize()) {
        if (isLoading) {
            CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
        } else {
            LazyColumn {
                items(articles) { article ->
                    ArticleItem(article)
                }
            }
        }
    }
}
\`\`\`

## MVVM Architecture Implementation

### Repository Pattern

- Repository serves as a single entry point for data sources
- Handle data caching logic, coordinate local and remote data
- Return Flow or LiveData to support reactive programming
- Handle data transformation logic, convert network/database models to domain models
- Implement offline-first strategy to improve application stability

\`\`\`kotlin
class ArticleRepository(
    private val remoteDataSource: ArticleRemoteDataSource,
    private val localDataSource: ArticleLocalDataSource
) {
    fun getArticles(): Flow<List<Article>> = flow {
        // First emit local data
        emit(localDataSource.getArticles())
        
        // Then try to fetch remote data and update local
        try {
            val remoteArticles = remoteDataSource.getArticles()
            localDataSource.saveArticles(remoteArticles)
            emit(localDataSource.getArticles())
        } catch (e: Exception) {
            // Handle network errors
        }
    }
}
\`\`\`

### Dependency Injection

- Use Hilt or Koin for dependency injection
- Define clear module boundaries and dependencies
- Use @Inject constructor to inject dependencies
- Provide mock implementations for testing
- Use ViewModelFactory to create ViewModel instances

\`\`\`kotlin
// Dependency injection example using Hilt
@Module
@InstallIn(SingletonComponent::class)
object AppModule {
    @Provides
    @Singleton
    fun provideArticleRepository(
        api: ApiService,
        database: AppDatabase
    ): ArticleRepository {
        return ArticleRepositoryImpl(api, database.articleDao())
    }
}

@AndroidEntryPoint
class MainActivity : AppCompatActivity() {
    private val viewModel: MainViewModel by viewModels()
}
\`\`\`

### Error Handling

- Use Result class to encapsulate operation results and error information
- Use sealed classes to represent different loading states
- Handle errors uniformly in ViewModel, expose error states through LiveData or Flow
- Implement graceful error recovery strategies
- Use coroutine exception handling mechanisms to catch and handle exceptions

\`\`\`kotlin
sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val exception: Exception) : Result<Nothing>()
    object Loading : Result<Nothing>()
}

class ArticleViewModel(private val repository: ArticleRepository) : ViewModel() {
    private val _articlesState = MutableStateFlow<Result<List<Article>>>(Result.Loading)
    val articlesState: StateFlow<Result<List<Article>>> = _articlesState
    
    fun loadArticles() {
        viewModelScope.launch {
            _articlesState.value = Result.Loading
            try {
                val articles = repository.getArticles()
                _articlesState.value = Result.Success(articles)
            } catch (e: Exception) {
                _articlesState.value = Result.Error(e)
            }
        }
    }
}
\`\`\`

## Best Practices

### Coroutines and Asynchronous Operations

- Use coroutines for asynchronous operations, avoid callback hell
- Use appropriate coroutine scopes (viewModelScope, lifecycleScope)
- Use withContext to execute operations on specific threads
- Use Flow for streaming data
- Handle coroutine exceptions and cancellation properly

\`\`\`kotlin
class ArticleRepository(private val apiService: ApiService) {
    suspend fun getArticles(): List<Article> = withContext(Dispatchers.IO) {
        apiService.getArticles()
    }
}

class ArticleViewModel(private val repository: ArticleRepository) : ViewModel() {
    fun loadArticles() {
        viewModelScope.launch {
            try {
                val articles = repository.getArticles()
                // Handle results
            } catch (e: Exception) {
                // Handle errors
            }
        }
    }
}
\`\`\`

### Data Binding and UI Updates

- Use ViewBinding or DataBinding to access views
- Unidirectional data flow: from ViewModel to UI
- Use DiffUtil for efficient RecyclerView updates
- Use ListAdapter to simplify list updates
- State management: use sealed classes to represent UI states

\`\`\`kotlin
// Using ViewBinding
class ArticleFragment : Fragment() {
    private var _binding: FragmentArticleBinding? = null
    private val binding get() = _binding!!
    
    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentArticleBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}

// Using ListAdapter
class ArticleAdapter : ListAdapter<Article, ArticleViewHolder>(DIFF_CALLBACK) {
    companion object {
        private val DIFF_CALLBACK = object : DiffUtil.ItemCallback<Article>() {
            override fun areItemsTheSame(oldItem: Article, newItem: Article): Boolean {
                return oldItem.id == newItem.id
            }
            
            override fun areContentsTheSame(oldItem: Article, newItem: Article): Boolean {
                return oldItem == newItem
            }
        }
    }
    
    // Implement other methods...
}
\`\`\`

### Pagination and Load More

- Use Paging 3 library for pagination
- Implement PagingSource and RemoteMediator to handle paginated data
- Use CombinedLoadStates to handle pagination states
- Implement preloading to fetch data in advance
- Support refresh operations

\`\`\`kotlin
class ArticlePagingSource(
    private val apiService: ApiService
) : PagingSource<Int, Article>() {
    override suspend fun load(params: LoadParams<Int>): LoadResult<Int, Article> {
        val page = params.key ?: 1
        return try {
            val response = apiService.getArticles(page, params.loadSize)
            LoadResult.Page(
                data = response.articles,
                prevKey = if (page == 1) null else page - 1,
                nextKey = if (response.articles.isEmpty()) null else page + 1
            )
        } catch (e: Exception) {
            LoadResult.Error(e)
        }
    }
}

// Using in ViewModel
val articlesFlow = Pager(
    config = PagingConfig(pageSize = 20, enablePlaceholders = false),
    pagingSourceFactory = { articlePagingSource }
).flow.cachedIn(viewModelScope)
\`\`\`

### Testing Strategy

- Unit tests: ViewModel, Repository, UseCase
- Use mockk or Mockito to mock dependencies
- Integration tests: Room database operations
- UI tests: use Espresso or Compose UI testing
- Use Fake implementations instead of real dependencies for testing

\`\`\`kotlin
@Test
fun \`load articles returns success with data\`() = runTest {
    // Arrange
    val fakeArticles = listOf(Article(1, "Title", "Content"))
    coEvery { repository.getArticles() } returns fakeArticles
    
    // Act
    viewModel.loadArticles()
    
    // Assert
    val state = viewModel.articlesState.value
    assertTrue(state is Result.Success)
    assertEquals(fakeArticles, (state as Result.Success).data)
}
\`\`\`

### Performance Optimization

- Use ViewHolder recycling and RecyclerView's DiffUtil
- Lazy loading fragments
- Use coroutines instead of threads to reduce resource consumption
- Use Room's indexing to optimize database queries
- Use Glide or Coil for efficient image loading with caching support
- Implement data prefetching and caching strategies

### Security

- Use EncryptedSharedPreferences to store sensitive data
- Implement secure network communication (HTTPS, certificate pinning)
- Use SafetyNet to detect device security status
- Implement appropriate data validation and sanitization
- Avoid logging sensitive information
`,
    author: {
      name: "lizy",
      url: "https://github.com/lizy-coding",
      avatar: null
    },
  },
];