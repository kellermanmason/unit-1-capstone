import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import RecipeCreatePage from "../pages/RecipeCreatePage";
import DashboardPage from "../pages/DashboardPage";
import api from "../services/api";

vi.mock("../services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

function renderWithRouter(component) {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  api.get.mockResolvedValue({ data: [] });
});

describe("LoginPage", () => {
  it("renders the login form", () => {
    renderWithRouter(<LoginPage />);

    expect(
      screen.getByRole("heading", { name: /welcome back/i }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /^login$/i }),
    ).toBeInTheDocument();
  });
});

describe("SignupPage", () => {
  it("renders the account creation form", () => {
    renderWithRouter(<SignupPage />);

    expect(
      screen.getByRole("heading", { name: /create an account/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/email|username/i),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /create account/i }),
    ).toBeInTheDocument();
  });
});

describe("RecipeCreatePage", () => {
  it("renders the recipe creation fields", () => {
    renderWithRouter(<RecipeCreatePage />);

    expect(
      screen.getByRole("heading", { name: /create a recipe/i }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ingredients/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/instructions/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /save recipe/i }),
    ).toBeInTheDocument();
  });
});

describe("DashboardPage", () => {
  it("loads and displays the empty dashboard state", async () => {
    renderWithRouter(<DashboardPage />);

    await waitFor(() => {
      expect(
        screen.getByText(/your recipes will show up here/i),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole("heading", { name: /your recipes/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /create recipe/i }),
    ).toHaveAttribute("href", "/recipes/new");

    expect(
      screen.getByRole("link", { name: /browse recipes/i }),
    ).toHaveAttribute("href", "/recipes");
  });
});