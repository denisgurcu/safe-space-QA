import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import './Breath.css';
import ImageCard from '../components/ImageCard';


const predefinedCategories = [
  { title: "Forest", query: "calm forest, ambient nature" },
  { title: "Ocean", query: "calm ocean, peaceful beach" },
  { title: "Starry Night", query: "starry sky, ambient night" },
  { title: "Sky", query: "calm sky, ambient clouds" },
  { title: "Mountain", query: "calm mountains, ambient nature" },
];

const Breath = () => {
  const [images, setImages] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('calm nature');
  const { selectedImage, setSelectedImage } = useOutletContext(); 
  const [favorites, setFavorites] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); // Get the current route
  const [textColor, setTextColor] = useState('var(--darkblack)'); // Default text color
  const [textShadow, setTextShadow] = useState('none'); // Default: no shadow
  const [loading, setLoading] = useState(false);




  const gridRef = useRef(null);

  // Function to determine image brightness
  const getImageBrightness = async (imageUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = imageUrl;

      img.onload = function () {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let totalBrightness = 0;
        let count = 0;

        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const brightness = (r + g + b) / 3;
          totalBrightness += brightness;
          count++;
        }

        const avgBrightness = totalBrightness / count;
        resolve(avgBrightness);
      };
    });
  };

  useEffect(() => {
    if (selectedImage) {
      getImageBrightness(selectedImage).then((brightness) => {
        if (brightness < 128) {
          setTextColor('#F8F1E5'); //  Dark background → Soft warm white
          setTextShadow('2px 2px 6px rgba(0,0,0,0.8)'); // Strong black shadow
        } else {
          setTextColor('#222222'); //  Bright background → Softer deep black
          setTextShadow('2px 2px 6px rgba(255,255,255,0.3)'); // Soft white glow
        }
      });
    }
  }, [selectedImage]);


  // Fetch images based on the search query
  const fetchImages = async (query) => {
    setLoading(true); // Show spinner

    try {
      const combinedQuery = `${query} ambient wallpaper`; // Combine query with ambient wallpaper
      const url = `https://api.pexels.com/v1/search?query=${combinedQuery}&per_page=12`; // Pexels API URL
      const response = await axios.get(url, {
        headers: {
          Authorization: 'LoMLMPs6TTD9bKIgH5D84oofbhEdINB1H9auN3rsCxvF6FZz0m0FaPeg', // API key
        },
      });

      const filteredImages = response.data.photos.filter(
        (photo) => photo.width >= 1920 && photo.height >= 1080 // Filter high-resolution images
      );

      setImages(filteredImages.slice(0, 12)); // Update state with the first 12 images
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false); // Hide spinner after fetching
    }
  };


  useEffect(() => {
    if (location.state?.updatedBackground) {
      setSelectedImage(location.state.updatedBackground); // Update global state
      localStorage.setItem('breathSelectedBackground', location.state.updatedBackground); //  Store new background
    } else {
      const savedBackground = localStorage.getItem('breathSelectedBackground');
      if (savedBackground) {
        setSelectedImage(savedBackground); // Ensure background is restored on page load
      }
    }
  }, [location.state, setSelectedImage]); // Trigger when state changes
  

  useEffect(() => {
    if (location.pathname === '/breath') { // Ensure this runs ONLY on the Breath page
      if (selectedImage) {
        // ✅ Apply background
        document.body.style.backgroundImage = `url(${selectedImage})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundAttachment = 'fixed';
  
        localStorage.setItem('breathSelectedBackground', selectedImage);
  
        // ✅ Adjust text color dynamically
        getImageBrightness(selectedImage).then((brightness) => {
          if (brightness < 128) {
            setTextColor('#F8F1E5'); // Dark background → Light text
            setTextShadow('2px 2px 6px rgba(0,0,0,0.8)'); 
          } else {
            setTextColor('#222222'); // Light background → Dark text
            setTextShadow('2px 2px 6px rgba(255,255,255,0.3)'); 
          }
        });
      } else {
        // ✅ Reset background and color settings when no image is selected
        document.body.style.backgroundImage = 'none';
        document.body.style.backgroundColor = 'var(--blue)';
        setTextColor('var(--darkblack)');
        setTextShadow('none');
      }
    }
  }, [selectedImage, location.pathname]); // Ensures this runs ONLY when `selectedImage` or page changes
  
  

  useEffect(() => {
    fetchImages(searchQuery); // Fetch images based on the search query
  }, [searchQuery]);

  // Fav function
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || []; // Load favorites from localStorage
    setFavorites(savedFavorites); // Set favorites in state
  }, []);

  const toggleFavorite = (image) => {
    setFavorites((prev) => {
      const updatedFavorites = prev.some((fav) => fav.id === image.id)
        ? prev.filter((fav) => fav.id !== image.id) // Remove from favorites if already exists
        : [...prev, image]; // Add to favorites if not already there

      // Save updated favorites to localStorage
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      return updatedFavorites;
    });
  };

  // Handle click on image details to navigate to another page
  const handleDetailsClick = async (image) => {
    try {
      const similarQuery = `${image.alt} ambient wallpaper`; // Search for similar images
      const response = await axios.get(
        `https://api.pexels.com/v1/search?query=${similarQuery}&per_page=12`,
        {
          headers: { Authorization: 'LoMLMPs6TTD9bKIgH5D84oofbhEdINB1H9auN3rsCxvF6FZz0m0FaPeg' }, // API key
        }
      );

      const fetchedSimilarImages = response.data.photos; // Get similar images

      navigate('/details', {
        state: {
          image: {
            ...image,
            src: {
              ...image.src,
              large: image.src.original, // Use original size for large image
            },
          },
          similarImages: fetchedSimilarImages, // Pass similar images to details page
          favorites,
        },
      });
    } catch (error) {
      console.error('Error fetching similar images:', error);
    }
  };

  // Handle search input
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim() !== '') {
      setSearchQuery(searchInput.trim()); // Update search query based on input
    }
  };

  // Reset search and background to default
  const resetToDefault = () => {
    setSearchInput('');
    setSearchQuery('calm nature'); // Reset to default search
    setActiveCategory(null);
    fetchImages('calm nature'); // Fetch default images again

    setSelectedImage(null); // Clear selected image state

    // Reset the background color explicitly
    document.body.style.backgroundImage = 'none';
    document.body.style.backgroundColor = 'var(--blue)';

    // Store the default setting in localStorage
    localStorage.setItem('breathSelectedBackground', ''); // Save empty background
};

  const navigateToFavorites = () => {
    navigate('/favs'); // Navigate to favorites page
  };

  const handleClearSearch = () => {
    setSearchInput('');  // ✅ Clears input field
    setSearchQuery('calm nature');  // ✅ Reset to default search query
    setActiveCategory(null);  
    fetchImages('calm nature'); // ✅ Fetch default images again
  };
  

  return (
    <div className="breath-of-fresh-air">
      <h1 style={{ color: textColor, textShadow: textShadow }}>Where would you like to be right now?</h1>
      <p style={{ color: textColor, textShadow: textShadow }}>
        Select an image below to set your background, then click continue at the bottom!
      </p>
      {/* Categories */}
      <div className="categories">
        {predefinedCategories.map((category, index) => (
          <button
            key={index}
            className={`category-btn ${activeCategory === category.title ? 'active' : ''}`}
            onClick={() => {
              setSearchQuery(category.query); // Set search query based on selected category
              setActiveCategory(category.title); // Set active category
            }}
          >
            {category.title}
          </button>
        ))}
        <button className="reset-btn" onClick={resetToDefault}>
          Default
        </button>
        <button className="favorites-btn" onClick={navigateToFavorites}>
          Favorites
        </button>
      </div>

      {/* Search Bar */}
      <form className="search-bar" onSubmit={handleSearchSubmit}>
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Select a category or search for a background (e.g., river, sunrise...)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)} // Update search input
          />
          {searchInput && (
            <button type="button" className="clear-btn" onClick={handleClearSearch}>X</button>
          )}
        </div>
        <button type="submit">Search</button>
      </form>

      {loading && <div className="spinner"></div>}

      {!loading && (
        <div className="grid-wrapper">
          <div className="image-grid" ref={gridRef}>
            {images.map((image, index) => (
              <ImageCard
                key={image.id}
                image={image}
                isFavorite={favorites.some((fav) => fav.id === image.id)}
                handleFavClick={toggleFavorite}
                handleSetBackground={setSelectedImage}
                handleDetailsClick={handleDetailsClick}
                cardNumber={index + 1}
                isDetailsPage={location.pathname === '/details'}
              />
            ))}
          </div>
        </div>
      )}

      {/* Continue Button at the Bottom */}
      <div className="continue-btn-wrapper">
        <button
          className="continue-btn"
          onClick={() => {
            navigate('/sound', {
              state: { updatedBackground: selectedImage }, // Pass background as state
            });
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default Breath;
