/**
 * @jest-environment jsdom
 */
import {screen, waitFor, fireEvent,} from "@testing-library/dom"
import '@testing-library/jest-dom'

import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js";
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js"
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)

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
    describe("When I'm an the bill page", () => {

      // Test intégration pour handleCLickIconEye
      test('Then call the handleClickIconEye when i click on iconEye', () => {    
        document.body.innerHTML = BillsUI({ data: bills }) // J'affiche le html a partir des données mockées dans fixture/bills.js
        const bill = new Bills({ document, onNavigate: (pathname) => document.body.innerHTML = ROUTES({ pathname })}) // création nouvelle instance de Bills
        
        const eyesIcons = screen.getAllByTestId('icon-eye') // Selection tout les elements EYE du DOM 
        expect(eyesIcons).toBeTruthy() // test si les elements EYES du DOM ne sont pas null ou undifined tout ce qui n'est pas falsy est truthy
        const eyeIcon1 = eyesIcons[0] // On selectionne le premeier eyeIcon (INDEX0)
        const handleClickIconEye = jest.fn(bill.handleClickIconEye(eyeIcon1))// on simule la fonction handleClickIconEye avec jest.fn sur l'icon1
        // correction dans setup jest pour utiliser jest.fn avec jquery
        eyeIcon1.addEventListener("click", handleClickIconEye) // on ajoute le listener qui call la fonction simuler au click
        expect(eyeIcon1).toBeTruthy() // on test si l'icone est defini
        fireEvent.click(eyeIcon1) // on simule le click avec le fireEvent importé depuis jest
        expect(handleClickIconEye).toHaveBeenCalled() // test si la fonction est bien appelée
        expect(screen.getByText("Justificatif")).toBeTruthy()
      })

      // Test intégration pour handleClickNewBill
      test("Then call the handleClickNewBill when i click on the buttonNewBill", () => {
        document.body.innerHTML = BillsUI({ data: bills }) // J'affiche le html donc le newBill button
        const bill = new Bills({ document, onNavigate: (pathname) => document.body.innerHTML = ROUTES({ pathname })}) // création nouvelle instance de Bills

        const newBillBtn = screen.getByTestId('btn-new-bill') // recupere le btn via le data-testId
        expect(newBillBtn).toBeTruthy() // test si le btn est défnini
        const handleCLickNewBill = jest.fn(bill.handleClickNewBill()) // simule la fonction handleClickNewBill
        newBillBtn.addEventListener("click", handleCLickNewBill) // ajout de l'envent listener qui call la fonction
        fireEvent.click(newBillBtn) // on simule le click sur le btn
        expect(handleCLickNewBill).toHaveBeenCalled() // on est si la fonction est bien call
        expect(screen.getByText('Envoyer une note de frais')).toBeTruthy() // Test pour savoir si la page est bien affiché en testant si "Envoyer noite de frais est bien affiché"
      })
    })
  })
  
  // Test d'intégration pour GET 
describe("Given that I'am a user connected as an employee", () => {
    describe("When I navigate to Bills", () => {
      test("fetches bills from mock API GET", async () => {
        const spyBills = jest.spyOn(mockStore, "bills") // surveille l'appel de la fonction
        const prout = await mockStore.bills().list()

      expect(spyBills).toHaveBeenCalledTimes(1)
      expect(prout.length).toBe(4)
      })  

      describe("When an error occurs on API", () => {

        test("fetches bills from an API and fails with 404 message error", async() => {
          jest.spyOn(mockStore, "bills") // fonction qui surveille l'appel de la fonction bills qui renvoie l'objet mockStore
          mockStore.bills.mockImplementationOnce(() => { // simule le rejet de la promesse

              return Promise.reject(new Error("Erreur 404"))
          })
          document.body.innerHTML = BillsUI( {error : "Erreur 404"}) // crée la page bills UI lorsqu'uil y a une erreur 404
          const error = await screen.getByText(/Erreur 404/) // await un l'element qui contient erreur 404
          expect(error).toBeTruthy() // test si l'élement contenant erreur 404 est défini
        })

        test("fetches bills from an API and fails with 500 message error", async () => {
          jest.spyOn(mockStore, "bills")
          mockStore.bills.mockImplementationOnce(() => {

              return Promise.reject(new Error("Erreur 500"))
          })
          document.body.innerHTML = BillsUI( {error : "Erreur 500"})
          const error = await screen.getByText(/Erreur 500/)
          expect(error).toBeTruthy()
        })
    })
  })
})