/**
 * @jest-environment jsdom
 */
import {screen, waitFor, fireEvent} from "@testing-library/dom"
import '@testing-library/jest-dom'

import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js";
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import store from "../__mocks__/store.js"

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      // On expect que la class de l'element icon-window soit active-icon qui signifie qu'il est en surbrillance
      expect(windowIcon.classList.value).toBe("active-icon")

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})
  describe("Given I'm connected has an employee", () => {
    describe("Given I'm an the bill page", () => {
      // Test pour handleCLickIconEye
      test('Should call the handleClickIconEye when i click on iconEye', ()=>{    
        document.body.innerHTML = BillsUI({ data: bills }) // J'affiche le html a partir des données mockées dans fixture/bills.js
        const bill = new Bills({ document, onNavigate: (pathname) => document.body.innerHTML = ROUTES({ pathname })})
        
        const eyesIcons = screen.getAllByTestId('icon-eye') // Selection tout les elements EYE du DOM
        expect(eyesIcons).toBeTruthy() // test si les elements EYES du DOM ne sont pas null ou undifined
        const eyeIcon1 = eyesIcons[0] // On selectionne le premeier eyeIcon (INDEX0)
        const handleClickIconEye = jest.fn(bill.handleClickIconEye(eyeIcon1))// on simule la fonction handleClickIconEye avec jest.fn sur l'icon1
        // correction dans setup jest pour utiliser jest.fn avec jquery
        eyeIcon1.addEventListener("click", handleClickIconEye) // on ajout le listner qui call la fonction simuler au click
        expect(eyeIcon1).toBeTruthy() // on test si l'icone est defini
        fireEvent.click(eyeIcon1) // on simule le click avec le fireEvent importé depuis jest
        expect(handleClickIconEye).toHaveBeenCalled() // test si la fonction est bien appelée
      })
    })
  })