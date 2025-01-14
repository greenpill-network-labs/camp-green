import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

import { HomeDataProps } from "@/hooks/views/useHome";

interface ContributionsProps extends HomeDataProps {}

const Contributions: React.FC<ContributionsProps> = (
  {
    // address,
    // confirmationMap,
    // contributions,
  }
) => {
  const navigate = useNavigate();
  const location = useLocation();

  function handleCardClick(id: string) {
    navigate(`/contributions/${id}`);
  }

  return (
    <section className={`relative w-full h-full`}>
      <div className="flex justify-between w-full">
        <h4>Contributions</h4>
        <div></div>
      </div>
      {location.pathname === "/contributions" ? (
        <ul className={`relative w-full h-full`}>
          {Array.from({ length: 5 }).map((_, index) => (
            <li className="p-1" onClick={() => handleCardClick("")}>
              {index}
            </li>
          ))}
        </ul>
      ) : null}
      <Outlet />
    </section>
  );
};

export default Contributions;
