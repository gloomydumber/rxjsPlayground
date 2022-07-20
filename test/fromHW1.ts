import { LoadPropertiesPort } from "../../../../src/application/port/out/loadPropertiesPort";
import { LoadShopOrderPort } from "../../../../src/application/port/out/loadShopOrderPort";
import { UpdateDailyPort } from "../../../../src/application/port/out/updateDailyPort";
import { UpdateShopsService } from "../../../../src/application/service/updateShopsService";

describe("updateShopsService test", () => {
  it("", () => {
    const loadPropertiesPortMock: LoadPropertiesPort = {
      loadProperties: jest.fn().mockReturnValue(
        new Array({
          shopId: "shopId",
          accessKey: "accessKey",
          secretKey: "secretKey",
          vendorId: "vendorId",
        })
      ),
    };

    const loadShopOrderPortMock: LoadShopOrderPort = {
      loadShopOrder: jest.fn().mockReturnValue({
        order: 10,
        revenue: 10000,
      }),
    };

    const updateDailyPortMock: UpdateDailyPort = {
      updateDaily: jest.fn().mockReturnValue({}),
    };

    const updateShopsService = new UpdateShopsService(
      loadPropertiesPortMock,
      loadShopOrderPortMock,
      updateDailyPortMock
    );

    const result = updateShopsService.updateShops("uid", "2022-06-22");

    expect(loadPropertiesPortMock.loadProperties).toBeCalled();
    expect(loadShopOrderPortMock.loadShopOrder).toBeCalled();
    expect(updateDailyPortMock.updateDaily).toBeCalled();
    expect(result).toStrictEqual({ order: 10, revenue: 10000 });
  });
});
