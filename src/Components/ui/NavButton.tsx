import React from "react";
import styled from "styled-components";
import { useAppSelector } from "../hooks/useRedux";

interface Props {
  oneClick?: () => void;
  isOpen: boolean;
}


const NavButton: React.FC<Props> = ({ oneClick, isOpen }) => {
  const isDark = useAppSelector((state) => state.theme.isDark);
  let colorClass = isDark ? "bg-white" : "bg-black";
  return (
    <StyledWrapper onClick={oneClick} $isOpen={isOpen}>
      <span className={colorClass} />
      <span className={colorClass} />
      <span className={colorClass} />
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div<{ $isOpen: boolean }>`
  /* These were the .burger styles */
  position: relative;
  width: 40px;
  height: 30px;
  background: transparent;
  cursor: pointer;
  display: block;

  /* These are the .burger span styles */
  span {
    display: block;
    position: absolute;
    height: 4px;
    width: 100%;
    
    border-radius: 9px;
    opacity: 1;
    left: 0;
    transform: rotate(0deg);
    transition: 0.25s ease-in-out;
  }

 

  span:nth-of-type(1) {
    top: 0px;
    transform-origin: left center;
    /* Apply styles only if $isOpen is true */
    ${(props) =>
      props.$isOpen &&
      `
      transform: rotate(45deg);
      top: 0px;
      left: 5px;
    `}
  }

  span:nth-of-type(2) {
    top: 50%;
    transform: translateY(-50%);
    transform-origin: left center;
    ${(props) =>
      props.$isOpen &&
      `
      width: 0%;
      opacity: 0;
    `}
  }

  span:nth-of-type(3) {
    top: 100%;
    transform-origin: left center;
    transform: translateY(-100%);
    ${(props) =>
      props.$isOpen &&
      `
      transform: rotate(-45deg);
      top: 28px;
      left: 5px;
    `}
  }
`;

export default NavButton;
