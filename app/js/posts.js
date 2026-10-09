import api from "./api.js";

// Load wana posts store karaganna Map ekak
const postsStore = new Map();

function createCardHTML(post) {
  const imageUrl =
    post.image_url ||
    "https://static.vecteezy.com/system/resources/thumbnails/057/068/323/small/single-fresh-red-strawberry-on-table-green-background-food-fruit-sweet-macro-juicy-plant-image-photo.jpg";

  return `
    <div class="card" data-id="${post.id}">
      <img class="card-bg" src="${imageUrl}" alt="${post.title || "Post Image"}" />
      <div class="overlay"></div>
      <div class="details">
        <h2>${post.title}</h2>
        <p>${post.content || post.description || ""}</p>
        <button class="btn view-post-btn" data-id="${post.id}">View</button>
      </div>
    </div>
  `;
}

// Modal eka display karana function eka
export function openPostModal(post) {
  const modal = document.getElementById("post-modal");
  const modalImg = document.getElementById("modal-post-img");
  const modalTitle = document.getElementById("modal-post-title");
  const modalDesc = document.getElementById("modal-post-desc");

  if (!modal || !post) return;

  modalImg.src =
    post.image_url ||
    "https://static.vecteezy.com/system/resources/thumbnails/057/068/323/small/single-fresh-red-strawberry-on-table-green-background-food-fruit-sweet-macro-juicy-plant-image-photo.jpg";
  modalTitle.textContent = post.title || "Untitled Post";
  modalDesc.textContent =
    post.content || post.description || "No content available.";

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden"; // Background scrolling stop karanna
}

export function closePostModal() {
  const modal = document.getElementById("post-modal");
  if (modal) {
    modal.classList.add("hidden");
    document.body.style.overflow = "auto";
  }
}

export async function loadPublicPosts(search = "", page = 1, limit = 10) {
  const container = document.querySelector("#main-view .pins-grid");
  if (!container) return;

  container.innerHTML = "<p>Loading posts...</p>";

  try {
    const response = await api.get("/posts/get-all-posts", {
      params: { search, page, limit },
    });

    const posts = Array.isArray(response.data)
      ? response.data
      : response.data.items || response.data.posts || [];

    if (posts.length === 0) {
      container.innerHTML = "<p>No posts found.</p>";
      return;
    }

    // Post details save karaganna
    posts.forEach((post) => postsStore.set(String(post.id), post));

    container.innerHTML = posts.map((post) => createCardHTML(post)).join("");
  } catch (err) {
    console.error("Failed to fetch public posts:", err);
    container.innerHTML = "<p>Error loading public posts.</p>";
  }
}

export async function loadUserPosts(search = "", page = 1, limit = 10) {
  const container = document.querySelector("#my-view .pins-grid");
  if (!container) return;

  container.innerHTML = "<p>Loading your posts...</p>";

  try {
    const userID = localStorage.getItem("userID");
    if (!userID) {
      container.innerHTML = "<p>User session missing. Please log in again.</p>";
      return;
    }

    const response = await api.get(`/posts/get-all/${userID}`, {
      params: { search, page, limit },
    });

    const posts = Array.isArray(response.data)
      ? response.data
      : response.data.items || response.data.posts || [];

    if (posts.length === 0) {
      container.innerHTML = "<p>You have not created any posts yet.</p>";
      return;
    }

    // User ge posts th store karaganna
    posts.forEach((post) => postsStore.set(String(post.id), post));

    container.innerHTML = posts.map((post) => createCardHTML(post)).join("");
  } catch (err) {
    console.error("Failed to fetch user posts:", err);
    container.innerHTML = "<p>Error loading your posts.</p>";
  }
}

// "View" button clicks saha Modal close listeners setup karanna
document.addEventListener("click", (e) => {
  // View button click unada check kirima
  const viewBtn = e.target.closest(".view-post-btn");
  if (viewBtn) {
    const postId = viewBtn.dataset.id;
    const post = postsStore.get(String(postId));
    if (post) {
      openPostModal(post);
    }
    return;
  }

  // Modal eka close karana buttons (X button eka ho black background eka)
  if (
    e.target.id === "modal-close-btn" ||
    e.target.id === "modal-close-backdrop"
  ) {
    closePostModal();
  }
});

// ESC key ebuwama modal eka close wenna
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closePostModal();
  }
});
