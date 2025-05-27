import { useState, useEffect } from 'react'
import '../App.css'
import { getDirectoryContents, getFileContent, getRawFileUrl, type GitHubContentItem } from '../hooks/github-hook'
import { Folder, File, ArrowLeft, X as CloseIcon } from 'lucide-react'

// Helper function to check for image extensions
const isImagePath = (filePath: string): boolean => {
  const imageExtensions = [/\.png$/i, /\.jpg$/i, /\.jpeg$/i, /\.gif$/i, /\.bmp$/i, /\.webp$/i, /\.svg$/i];
  return imageExtensions.some(ext => ext.test(filePath));
};

function ExampleNavigator() {
  const [repoItems, setRepoItems] = useState<GitHubContentItem[] | null>(null)
  const [loadingMessage, setLoadingMessage] = useState<string>('Loading repository contents...')
  const [currentPath, setCurrentPath] = useState<string>('')
  const [pathHistory, setPathHistory] = useState<string[]>([''])

  const [viewingMode, setViewingMode] = useState<'list' | 'file-text' | 'file-image'>('list')
  const [selectedFileItem, setSelectedFileItem] = useState<GitHubContentItem | null>(null)
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null)
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)
  const [isFileLoading, setIsFileLoading] = useState<boolean>(false)
  const [fileError, setFileError] = useState<string | null>(null)

  useEffect(() => {
    // This effect handles fetching directory listings when currentPath changes
    if (viewingMode === 'list') {
      setLoadingMessage(`Loading contents of '${currentPath || "root"}'...`)
      setRepoItems(null)
      setFileError(null)

      getDirectoryContents(currentPath)
        .then((items) => {
          if (items) {
            setRepoItems(items)
            setLoadingMessage('')
          } else {
            setRepoItems([])
            setLoadingMessage(`Failed to load contents of '${currentPath || "root"}' or directory is empty.`)
          }
        })
        .catch(() => {
          setRepoItems([])
          setLoadingMessage(`Error fetching contents of '${currentPath || "root"}'...`)
        })
    }
  }, [currentPath, viewingMode]) // Re-run if currentPath changes OR if viewingMode changes back to list

  const handleItemClick = async (item: GitHubContentItem) => {
    if (item.type === 'dir') {
      setViewingMode('list') // Ensure list mode when navigating dirs
      setPathHistory(prevHistory => [...prevHistory, item.path])
      setCurrentPath(item.path)
    } else if (item.type === 'file') {
      setSelectedFileItem(item)
      setIsFileLoading(true)
      setSelectedFileContent(null)
      setSelectedImageUrl(null)
      setFileError(null)

      if (isImagePath(item.path)) {
        setViewingMode('file-image')
        try {
          const url = await getRawFileUrl(item.path)
          if (url) {
            setSelectedImageUrl(url)
          } else {
            setFileError("Could not retrieve image URL.")
          }
        } catch (err) {
          setFileError("Error fetching image URL.")
        } finally {
          setIsFileLoading(false)
        }
      } else {
        setViewingMode('file-text')
        try {
          const content = await getFileContent(item.path)
          if (content !== null) {
            setSelectedFileContent(content)
          } else {
            setFileError("File is empty or could not be loaded.")
          }
        } catch (err) {
          setFileError("Error fetching file content.")
        } finally {
          setIsFileLoading(false)
        }
      }
    }
  }

  const handleBackClick = () => {
    if (pathHistory.length > 1) {
      const newHistory = [...pathHistory]
      newHistory.pop()
      setPathHistory(newHistory)
      setCurrentPath(newHistory[newHistory.length - 1])
    }
  }

  const handleBackToList = () => {
    setViewingMode('list')
    setSelectedFileItem(null)
    setSelectedFileContent(null)
    setSelectedImageUrl(null)
    setFileError(null)
    // currentPath and pathHistory remain, so useEffect will re-fetch current dir list if needed
  }

  // Determine current directory name for display
  const getCurrentDirName = () => {
    if (currentPath === "") return "root";
    const segments = currentPath.split('/');
    return segments[segments.length - 1];
  }

  if (viewingMode === 'file-text' || viewingMode === 'file-image') {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={handleBackToList} style={{ display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={16} style={{ marginRight: '5px' }} /> Back to {getCurrentDirName()} list
          </button>
          <h3>{selectedFileItem?.name}</h3>
          <span></span> {/* Placeholder for alignment if needed */}
        </div>
        {isFileLoading && <p>Loading file content...</p>}
        {fileError && <p style={{color: 'red'}}>{fileError}</p>}
        {!isFileLoading && !fileError && viewingMode === 'file-image' && selectedImageUrl && (
          <img src={selectedImageUrl} alt={selectedFileItem?.name} style={{ maxWidth: '100%', maxHeight: '80vh' }} />
        )}
        {!isFileLoading && !fileError && viewingMode === 'file-text' && selectedFileContent !== null && (
          <pre style={{ textAlign: 'left', whiteSpace: 'pre-wrap', border: '1px solid #ccc', padding: '10px', maxHeight: '80vh', overflowY: 'auto' }}>
            {selectedFileContent}
          </pre>
        )}
      </div>
    )
  }

  // Default: List view
  return (
    <>
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
          {pathHistory.length > 1 && (
            <button onClick={handleBackClick} style={{ marginRight: '10px' }}>
              <ArrowLeft size={16} style={{ marginRight: '5px' }} /> Back
            </button>
          )}
          <h2>Current Path: /{currentPath}</h2>
        </div>
        {loadingMessage && <p>{loadingMessage}</p>}
        {repoItems && repoItems.length > 0 && (
          <div>
            {repoItems.map((item) => (
              <button
                key={item.sha}
                onClick={() => handleItemClick(item)}
                style={{ display: 'flex', alignItems: 'center', margin: '5px' }}
                title={item.path}
              >
                {item.type === 'dir' ? (
                  <Folder size={16} style={{ marginRight: '8px' }} />
                ) : (
                  <File size={16} style={{ marginRight: '8px' }} />
                )}
                {item.name}
              </button>
            ))}
          </div>
        )}
        {repoItems && repoItems.length === 0 && !loadingMessage && (
          <p>No items found in this directory.</p>
        )}
      </div>
    </>
  )
}

export default ExampleNavigator
