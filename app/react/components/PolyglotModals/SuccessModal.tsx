import React from "react";
import { useTranslation } from "react-i18next";
import Dialog from "../Dialog";

export enum Type {
	workload = "workload",
	nfr = "nfr",
}

interface SuccessModalProps {
	type: Type;
	open: boolean;
	onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ type, open, onClose }) => {
	const { t } = useTranslation(["common"]);

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				if (!nextOpen) onClose();
			}}
			title={
				type === Type.workload
					? t("Workload added successfully!")
					: t("Non-functional Requirement added successfully!")
			}
			closeOnOverlayClick
			closeOnEscape
			contentStyle={{ backgroundColor: "white" }}
			titleStyle={{
				fontSize: "1.5em",
				fontWeight: "bold",
				marginLeft: "12px",
				padding: "8px",
			}}
		>
			<div className="modal-footer">
				<button
					className="br-button"
					type="button"
					onClick={onClose}
					style={{
						backgroundColor: "#009980",
						border: "none",
						borderRadius: "8px",
						color: "white",
						fontSize: "16px",
						padding: "12px",
					}}
				>
					{t("Confirm")}
				</button>
			</div>
		</Dialog>
	);
};

export default SuccessModal;
